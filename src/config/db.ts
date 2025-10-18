import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  user: env.db.user,
  host: env.db.host,
  database: env.db.name,
  password: env.db.password,
  port: env.db.port,
});
