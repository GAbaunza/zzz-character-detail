import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Create a new PostgreSQL client
const client = new Client({
  user: 'root',
  database: 'zzz_builds',
  hostname: 'localhost',
  password: 'root',
  port: 5432,
});

// Connect to the database
export async function connectDB() {
  await client.connect();
}

// Disconnect from the database
export async function disconnectDB() {
  await client.end();
}

export { client };