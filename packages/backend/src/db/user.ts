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

export async function getUserId(email: string): Promise<String>{
    const { rows } = await pool.query<{id: String}>(`SELECT id FROM users WHERE email = $1;`, [email]);
    if(rows && rows[0])
        return rows[0].id;
    return "";
}

