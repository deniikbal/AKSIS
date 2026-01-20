import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../src/db/schema';
import { account, user } from '../src/db/schema';
import { eq } from 'drizzle-orm';

config({ path: ['.env.local', '.env'] });

async function checkAccountDetails() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool, { schema });

    try {
        // First, get user with username 'administrator'
        const users = await db.select().from(user).where(eq(user.username, 'administrator')).limit(1);

        if (users.length === 0) {
            console.log("User not found!");
            await pool.end();
            return;
        }

        const adminUser = users[0];
        console.log("User ID:", adminUser.id);
        console.log("Username:", adminUser.username);
        console.log("Email:", adminUser.email);

        // Get all accounts for this user
        const accounts = await db.select().from(account).where(eq(account.userId, adminUser.id));

        console.log("\nAccounts found:", accounts.length);
        accounts.forEach((acc, idx) => {
            console.log(`\n--- Account ${idx + 1} ---`);
            console.log("ID:", acc.id);
            console.log("userId:", acc.userId);
            console.log("accountId:", acc.accountId);
            console.log("providerId:", acc.providerId);
            console.log("Password length:", acc.password?.length);
            console.log("Password preview:", acc.password?.substring(0, 50) + "...");
        });

        // Also check if there's a 'credential' provider account (the old one)
        console.log("\n--- Checking for any 'credential' provider accounts ---");
        const credAccounts = await db.select().from(account).where(eq(account.providerId, 'credential'));
        console.log("Credential provider accounts:", credAccounts.length);

        await pool.end();
    } catch (error) {
        console.error("Error:", error);
        await pool.end();
    }
}

checkAccountDetails();
