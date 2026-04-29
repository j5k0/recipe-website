import "dotenv/config";
import request from "supertest";
import type { Express } from "express";
import type { Pool } from "pg";

const testDbUrl = process.env.TEST_DB_URL;
const describeWithTestDb = testDbUrl ? describe : describe.skip;

describeWithTestDb("auth and preferences integration", () => {
  let app: Express;
  let pool: Pool;

  const unique = Date.now();
  const email = `integration-${unique}@example.test`;
  const name = `Integration User ${unique}`;
  const password = "correct-password";

  beforeAll(async () => {
    process.env.DB_URL = testDbUrl;
    process.env.JWT_SECRET ??= "integration-test-secret";
    process.env.SUPABASE_URL ??= "http://localhost:54321";
    process.env.SUPABASE_SERVICE_ROLE_KEY ??= "integration-test-key";

    const [{ createApp }, poolModule] = await Promise.all([
      import("../app"),
      import("../db/pool"),
    ]);

    app = createApp();
    pool = poolModule.pool;

    await pool.query("DELETE FROM users WHERE email = $1 OR user_name = $2", [
      email,
      name,
    ]);
  });

  afterAll(async () => {
    if (pool) {
      await pool.query("DELETE FROM users WHERE email = $1 OR user_name = $2", [
        email,
        name,
      ]);
      await pool.end();
    }
  });

  it("registers, logs in, reads the session, and stores preferences through real routes and DB", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email, name, password })
      .expect(201)
      .expect({ message: "User created" });

    const registeredUser = await pool.query<{
      user_name: string;
      password_hash: string;
    }>("SELECT user_name, password_hash FROM users WHERE email = $1", [email]);

    expect(registeredUser.rows).toHaveLength(1);
    expect(registeredUser.rows[0]).toMatchObject({ user_name: name });
    expect(registeredUser.rows[0].password_hash).not.toBe(password);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email, password })
      .expect(200)
      .expect({ message: "Logged in" });

    const setCookie = loginResponse.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    const authCookies = (Array.isArray(setCookie) ? setCookie : [setCookie]).filter(
      (cookie): cookie is string => typeof cookie === "string"
    );
    expect(authCookies).toEqual(
      expect.arrayContaining([expect.stringContaining("token=")])
    );

    await request(app)
      .get("/auth/whoami")
      .set("Cookie", authCookies)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          user_name: name,
          email,
          avatar_url: null,
        });
        expect(typeof res.body.unique_id).toBe("string");
        expect(res.body.unique_id.length).toBeGreaterThan(0);
      });

    await request(app)
      .put("/api/user/preferences")
      .set("Cookie", authCookies)
      .send({ email_notifications: false, marketing_emails: true })
      .expect(200)
      .expect({ success: true });

    await request(app)
      .get("/api/user/preferences")
      .set("Cookie", authCookies)
      .expect(200)
      .expect({
        email_notifications: false,
        marketing_emails: true,
      });
  });
});
