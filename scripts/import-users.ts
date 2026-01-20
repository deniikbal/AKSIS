import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { user, account } from '../src/db/schema';
import { randomUUID } from 'crypto';
import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';

config({ path: ['.env.local', '.env'] });

const DEFAULT_PASSWORD = "simkes123";

async function importUsers() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const jsonPath = join(process.cwd(), 'user_login.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const usersData = JSON.parse(rawData);

        console.log(`Loaded ${usersData.length} users from JSON.`);

        const filteredUsers = usersData.filter((u: any) =>
            u.level === 'Admin' || u.level === 'Guru'
        );

        console.log(`Filtering for Admin and Guru roles: ${filteredUsers.length} users found.`);

        for (const u of filteredUsers) {
            const userId = u.id || randomUUID();

            console.log(`Importing user: ${u.nama} (${u.userid})`);

            // Insert User
            const userEmail = u.email || `${u.userid}@placeholder.com`;

            await db.insert(user).values({
                id: userId,
                name: u.nama,
                email: userEmail,
                role: (u.level === 'Admin' ? 'admin' : 'guru') as any,
                username: u.userid,
                ptkId: u.ptk_id,
                isActive: u.is_active === 1,
                salt: u.salt,
                theme: u.thema || 'sma-theme',
                warnaHeader: u.warnaheader,
                warnaSide: u.warnaside,
            }).onConflictDoUpdate({
                target: user.id,
                set: {
                    username: u.userid,
                    ptkId: u.ptk_id,
                    isActive: u.is_active === 1,
                    role: (u.level === 'Admin' ? 'admin' : 'guru') as any,
                }
            });

            // Delete existing account records to prevent conflicts and ensure clean state
            await db.delete(account).where(eq(account.userId, userId));

            // Insert Account (Better-Auth credentials)
            // We reset password to a default one because legacy hashes aren't compatible
            const hashed = await hashPassword(DEFAULT_PASSWORD);

            await db.insert(account).values({
                id: randomUUID(),
                userId: userId,
                accountId: u.userid, // For 'credential' provider, accountId is the username
                providerId: 'credential',
                password: hashed,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        console.log('User import completed successfully!');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error importing users:', error);
        await pool.end();
        process.exit(1);
    }
}

importUsers();
