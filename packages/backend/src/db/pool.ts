import { Pool } from "pg"

export const pool = new Pool({
    connectionString: process.env.DB_URL,
    family: 4,
    //ssl: {rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
} as any);
