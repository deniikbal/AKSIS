import { readFileSync } from 'fs';
import { join } from 'path';

async function findDuplicateNis() {
    try {
        const jsonPath = join(process.cwd(), 'tabel_siswa.json');
        const rawData = readFileSync(jsonPath, 'utf8');
        const jsonData = JSON.parse(rawData);

        const nisMap = new Map();
        const duplicates = [];

        for (const s of jsonData) {
            if (!s.nis) continue;
            if (nisMap.has(s.nis)) {
                duplicates.push({
                    nis: s.nis,
                    original: nisMap.get(s.nis),
                    current: { id: s.peserta_didik_id, nama: s.nm_siswa }
                });
            } else {
                nisMap.set(s.nis, { id: s.peserta_didik_id, nama: s.nm_siswa });
            }
        }

        console.log(`Total duplicates found: ${duplicates.length}`);
        console.log("Sample duplicates:");
        console.log(JSON.stringify(duplicates.slice(0, 10), null, 2));

    } catch (error) {
        console.error('Failed to find duplicates:', error);
    }
}

findDuplicateNis();
