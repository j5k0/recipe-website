import bcrypt from "bcrypt";
import { pool } from "./pool";
import {
  createUser,
  deleteUser,
  findUser,
  getAvatarUrl,
  getUserId,
  getUserName,
  setAvatarUrl,
  updatePassword,
  updateProfile,
} from "./user";

jest.mock("./pool", () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

type QueryResultStub<T = unknown> = { rows?: T[] };

const queryMock = pool.query as unknown as jest.MockedFunction<
  (queryText: string, values?: unknown[]) => Promise<QueryResultStub>
>;
const hashMock = bcrypt.hash as unknown as jest.MockedFunction<
  (password: string, rounds: number) => Promise<string>
>;

const rows = <T>(items?: T[]): QueryResultStub<T> => ({ rows: items });

describe("db/user", () => {
  beforeEach(() => {
    queryMock.mockReset();
    hashMock.mockReset();
    hashMock.mockResolvedValue("hashed-password");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it.each([
      {
        dbRows: [{ id: "user-1" }],
        expected: true,
        label: "returns true when a user row is inserted",
      },
      {
        dbRows: [],
        expected: false,
        label: "returns false when the email conflict inserts nothing",
      },
    ])("$label", async ({ dbRows, expected }) => {
      queryMock.mockResolvedValue(rows(dbRows));

      await expect(
        createUser("Ada Lovelace", "ada@example.com", "plain-password")
      ).resolves.toBe(expected);

      expect(hashMock).toHaveBeenCalledWith("plain-password", 12);
      expect(queryMock).toHaveBeenCalledWith(
        "INSERT INTO users (email, user_name, password_hash) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id;",
        ["ada@example.com", "Ada Lovelace", "hashed-password"]
      );
    });
  });

  describe("findUser", () => {
    it("returns the user record when the email exists", async () => {
      queryMock.mockResolvedValue(
        rows([
          {
            id: "hidden-id",
            email: "ada@example.com",
            user_name: "Ada Lovelace",
            password_hash: "stored-hash",
          },
        ])
      );

      await expect(findUser("ada@example.com")).resolves.toEqual({
        email: "ada@example.com",
        user_name: "Ada Lovelace",
        password_hash: "stored-hash",
      });
      expect(queryMock).toHaveBeenCalledWith(
        "SELECT email, user_name, password_hash FROM users WHERE email = $1;",
        ["ada@example.com"]
      );
    });

    it("returns undefined when the email is not found", async () => {
      queryMock.mockResolvedValue(rows([]));

      await expect(findUser("missing@example.com")).resolves.toBeUndefined();
    });
  });

  describe("getUserId", () => {
    it("returns the user id when the email exists", async () => {
      queryMock.mockResolvedValue(rows([{ id: "user-123" }]));

      await expect(getUserId("ada@example.com")).resolves.toBe("user-123");
      expect(queryMock).toHaveBeenCalledWith(
        "SELECT id FROM users WHERE email = $1;",
        ["ada@example.com"]
      );
    });

    it("returns an empty string when the query returns no rows", async () => {
      queryMock.mockResolvedValue(rows([]));

      await expect(getUserId("missing@example.com")).resolves.toBe("");
    });

    it("returns an empty string when the query result has no rows collection", async () => {
      queryMock.mockResolvedValue(rows());

      await expect(getUserId("missing@example.com")).resolves.toBe("");
    });
  });

  describe("getAvatarUrl", () => {
    it("returns the stored avatar URL", async () => {
      queryMock.mockResolvedValue(
        rows([{ avatar_url: "https://cdn.example.com/avatar.png" }])
      );

      await expect(getAvatarUrl("ada@example.com")).resolves.toBe(
        "https://cdn.example.com/avatar.png"
      );
      expect(queryMock).toHaveBeenCalledWith(
        "SELECT avatar_url FROM users WHERE email = $1",
        ["ada@example.com"]
      );
    });

    it("returns null when the stored avatar value is null", async () => {
      queryMock.mockResolvedValue(rows([{ avatar_url: null }]));

      await expect(getAvatarUrl("ada@example.com")).resolves.toBeNull();
    });

    it("returns null when no user row exists", async () => {
      queryMock.mockResolvedValue(rows([]));

      await expect(getAvatarUrl("missing@example.com")).resolves.toBeNull();
    });
  });

  describe("setAvatarUrl", () => {
    it("updates the avatar URL for the email", async () => {
      queryMock.mockResolvedValue(rows([]));

      await expect(
        setAvatarUrl("ada@example.com", "https://cdn.example.com/avatar.png")
      ).resolves.toBeUndefined();

      expect(queryMock).toHaveBeenCalledWith(
        "UPDATE users SET avatar_url = $1 WHERE email = $2",
        ["https://cdn.example.com/avatar.png", "ada@example.com"]
      );
    });
  });

  describe("deleteUser", () => {
    it("deletes the user by email", async () => {
      queryMock.mockResolvedValue(rows([]));

      await expect(deleteUser("ada@example.com")).resolves.toBeUndefined();
      expect(queryMock).toHaveBeenCalledWith(
        "DELETE FROM users WHERE email = $1",
        ["ada@example.com"]
      );
    });
  });

  describe("updatePassword", () => {
    it("hashes the replacement password and stores the hash", async () => {
      hashMock.mockResolvedValue("new-hash");
      queryMock.mockResolvedValue(rows([]));

      await expect(
        updatePassword("ada@example.com", "new-password")
      ).resolves.toBeUndefined();

      expect(hashMock).toHaveBeenCalledWith("new-password", 12);
      expect(queryMock).toHaveBeenCalledWith(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        ["new-hash", "ada@example.com"]
      );
    });
  });

  describe("updateProfile", () => {
    it("trims and updates a new display name", async () => {
      queryMock.mockResolvedValue(rows([]));

      await updateProfile("ada@example.com", "  Countess Ada  ");

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        "UPDATE users SET user_name = $1 WHERE email = $2",
        ["Countess Ada", "ada@example.com"]
      );
    });

    it("trims and updates a new email address", async () => {
      queryMock.mockResolvedValue(rows([]));

      await updateProfile("ada@example.com", undefined, "  ada@new.test  ");

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        "UPDATE users SET email = $1 WHERE email = $2",
        ["ada@new.test", "ada@example.com"]
      );
    });

    it("updates the avatar when the new avatar URL is an empty string", async () => {
      queryMock.mockResolvedValue(rows([]));

      await updateProfile("ada@example.com", undefined, undefined, "");

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        "UPDATE users SET avatar_url = $1 WHERE email = $2",
        ["", "ada@example.com"]
      );
    });

    it("updates name, email, and avatar in order when all fields are supplied", async () => {
      queryMock.mockResolvedValue(rows([]));

      await updateProfile(
        "ada@example.com",
        "  Ada Byron  ",
        "  byron@example.com  ",
        "https://cdn.example.com/byron.png"
      );

      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        "UPDATE users SET user_name = $1 WHERE email = $2",
        ["Ada Byron", "ada@example.com"]
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        "UPDATE users SET email = $1 WHERE email = $2",
        ["byron@example.com", "ada@example.com"]
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        3,
        "UPDATE users SET avatar_url = $1 WHERE email = $2",
        ["https://cdn.example.com/byron.png", "ada@example.com"]
      );
    });

    it("skips blank name, blank email, and undefined avatar inputs", async () => {
      queryMock.mockResolvedValue(rows([]));

      await updateProfile("ada@example.com", "   ", "   ");

      expect(queryMock).not.toHaveBeenCalled();
    });
  });

  describe("getUserName", () => {
    it("returns the stored user name", async () => {
      queryMock.mockResolvedValue(rows([{ user_name: "Ada Lovelace" }]));

      await expect(getUserName("ada@example.com")).resolves.toBe(
        "Ada Lovelace"
      );
      expect(queryMock).toHaveBeenCalledWith(
        "SELECT user_name FROM users WHERE email = $1",
        ["ada@example.com"]
      );
    });

    it("returns null when no user name row exists", async () => {
      queryMock.mockResolvedValue(rows([]));

      await expect(getUserName("missing@example.com")).resolves.toBeNull();
    });
  });
});
