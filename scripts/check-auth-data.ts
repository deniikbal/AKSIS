import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../src/db/schema';
import { user, account } from '../src/db/schema';
import { eq } from 'drizzle-orm';

config({ path: ['.env.local', '.env'] });

async function checkData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool, { schema });

    try {
        console.log("Checking user: administrator");
        const users = await db.select().from(user).where(eq(user.username, 'administrator')).limit(1);
        const adminUser = users[0];

        if (!adminUser) {
            console.log("User 'administrator' NOT FOUND in 'user' table.");
        } else {
            console.log("User found:", JSON.stringify(adminUser, null, 2));

            const accounts = await db.select().from(account).where(eq(account.userId, adminUser.id));

            if (accounts.length === 0) {
                console.log("Account record NOT FOUND for this user.");
            } else {
                console.log(`Found ${accounts.length} account records.`);
                accounts.forEach((adminAccount, idx) => {
                    console.log(`Account ${idx + 1}:`, JSON.stringify({
                        id: adminAccount.id,
                        userId: adminAccount.userId,
                        accountId: adminAccount.accountId,
                        providerId: adminAccount.providerId,
                        hasPassword: !!adminAccount.password,
                        passwordSnippet: adminAccount.password?.substring(0, 20) + "..."
                    }, null, 2));
                });
            }
        }

        await pool.end();
    } catch (error) {
        console.error("Error:", error);
        await pool.end();
    }
}

checkData();
