import { pool } from "./pool";
import { User } from "../types";
import bcrypt from 'bcrypt';

export async function createUser(
  user: string,
  email: string,
  password: string
): Promise<Boolean> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = await pool.query<Response>(
        'INSERT INTO users (email, user_name, password_hash) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id;',
        [email, user, hashedPassword]
    );
    if(id.rows.length > 0)
        return true;
    return false;
}

export async function findUser(
    email: string,
    ){
    const { rows } = await pool.query<User>(
        'SELECT email, user_name, password_hash FROM users WHERE email = $1;',
        [email]
    );
    if(rows[0])
        return { email: rows[0].email, user_name: rows[0].user_name, password_hash: rows[0].password_hash } as User;
    else return;
}

export async function getUserId(email: string): Promise<string> {
    const { rows } = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = $1;`, [email]);
    if (rows && rows[0]) {
        return rows[0].id;
    }
    return "";
}

export async function getAvatarUrl(email: string): Promise<string | null> {
    const { rows } = await pool.query<{ avatar_url: string | null }>(
        'SELECT avatar_url FROM users WHERE email = $1',
        [email]
    );
    return rows[0]?.avatar_url ?? null;
}

export async function setAvatarUrl(email: string, url: string): Promise<void> {
    await pool.query('UPDATE users SET avatar_url = $1 WHERE email = $2', [url, email]);
}

export async function deleteUser(email: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
}

export async function updatePassword(email: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);
}

export async function updateProfile(email: string, newName?: string, newEmail?: string, avatarUrl?: string): Promise<void> {
    if (newName && newName.trim()) {
        await pool.query('UPDATE users SET user_name = $1 WHERE email = $2', [newName.trim(), email]);
    }
    if (newEmail && newEmail.trim()) {
        await pool.query('UPDATE users SET email = $1 WHERE email = $2', [newEmail.trim(), email]);
    }
    if (avatarUrl !== undefined) {
        await pool.query('UPDATE users SET avatar_url = $1 WHERE email = $2', [avatarUrl, email]);
    }
}

export async function getUserName(email: string): Promise<string | null> {
    const { rows } = await pool.query<{ user_name: string }>(
        'SELECT user_name FROM users WHERE email = $1',
        [email]
    );
    return rows[0]?.user_name ?? null;
}
