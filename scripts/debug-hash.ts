import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../src/db/schema';
import { account } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from 'better-auth/crypto';

config({ path: ['.env.local', '.env'] });

async function debugHash() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool, { schema });

    try {
        // Get the stored hash for administrator
        const accounts = await db.select().from(account).where(eq(account.accountId, 'adminraporsma@aplikasipasek.com')).limit(1);

        if (accounts.length === 0) {
            console.log("Account not found!");
            return;
        }

        const storedHash = accounts[0].password;
        console.log("Stored hash:", storedHash);
        console.log("Hash length:", storedHash?.length);

        // Generate a new hash with better-auth and compare format
        const newHash = await hashPassword("simkes123");
        console.log("\nNew hash from hashPassword:", newHash);
        console.log("New hash length:", newHash.length);

        // Try to verify
        if (storedHash) {
            const isValid = await verifyPassword({ hash: storedHash, password: "simkes123" });
            console.log("\nVerification result:", isValid);
        }

        await pool.end();
    } catch (error) {
        console.error("Error:", error);
        await pool.end();
    }
}

debugHash();
