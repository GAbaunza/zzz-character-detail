import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Create a new PostgreSQL client
const client = new Client({
  user: 'zzz_user',
  database: 'zzz_builds',
  hostname: '',
  password: '',
  port: 5432,
  tls: {
    enforce: false, // Disable TLS
  },
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