// Simple test to verify PostgreSQL connection
import pkg from "pg";
const { Client } = pkg;

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to PostgreSQL database");

    // Test query
    const result = await client.query("SELECT version()");
    console.log("Database version:", result.rows[0].version);

    await client.end();
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
  }
}

testConnection();
