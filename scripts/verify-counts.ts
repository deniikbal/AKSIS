import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { anggotaKelas, siswa, kelas } from '../src/db/schema.ts';
import { count } from 'drizzle-orm';

config({ path: ['.env.local', '.env'] });

async function verify() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    const db = drizzle(pool);

    try {
        const [siswaCount] = await db.select({ value: count() }).from(siswa);
        const [kelasCount] = await db.select({ value: count() }).from(kelas);
        const [anggotaCount] = await db.select({ value: count() }).from(anggotaKelas);

        console.log(`--- DATABASE COUNT VERIFICATION ---`);
        console.log(`- Siswa: ${siswaCount.value}`);
        console.log(`- Kelas: ${kelasCount.value}`);
        console.log(`- Anggota Kelas: ${anggotaCount.value}`);
        console.log(`-----------------------------------`);

        await pool.end();
    } catch (error) {
        console.error('Verification failed:', error);
        await pool.end();
    }
}

verify();
