import { pool } from "./pool";
import bcrypt from 'bcrypt';

export async function createUser(
  user: string,
  email: string,
  password: string
): Promise<Response> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { rows } = await pool.query<Response>(
        'INSERT INTO users (email, user_name, password_hash) VALUES ($1, $2, $3) RETURNING id;',
        [email, user, hashedPassword]
    );
  return rows[0];
}

