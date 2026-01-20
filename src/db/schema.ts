import { pgTable, text, timestamp, boolean, pgEnum, uuid, uniqueIndex, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const roleEnum = pgEnum('role', ['admin', 'guru', 'pembina'])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: roleEnum('role').notNull().default('guru'),
  username: text('username'),
  ptkId: uuid('ptk_id'),
  isActive: boolean('is_active').notNull().default(true),
  salt: text('salt'),
  theme: text('theme').default('sma-theme'),
  warnaHeader: text('warna_header'),
  warnaSide: text('warna_side'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    providerAccountIndex: uniqueIndex('provider_account_idx').on(table.providerId, table.accountId),
  }
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const guru = pgTable('guru', {
  id: uuid('id').defaultRandom().primaryKey(), // This will map to ptk_id
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  nip: text('nip').unique(),
  jenisPtkId: text('jenis_ptk_id'),
  jenisKelamin: text('jenis_kelamin'),
  tempatLahir: text('tempat_lahir'),
  tanggalLahir: text('tanggal_lahir'),
  nuptk: text('nuptk'),
  alamatJalan: text('alamat_jalan'),
  statusKeaktifanId: text('status_keaktifan_id'),
  softDelete: text('soft_delete').default('0'),
  telepon: text('telepon'), // Keep this from previous schema just in case
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const kelas = pgTable('kelas', {
  id: uuid('id').defaultRandom().primaryKey(), // rombongan_belajar_id
  waliKelasId: uuid('wali_kelas_id').references(() => guru.id), // ptk_id
  nama: text('nama').notNull(), // nm_kelas
  tingkat: text('tingkat'), // tingkat_pendidikan_id
  tahunAjaran: text('tahun_ajaran'), // e.g., "2025/2026"
  sekolahId: text('sekolah_id'),
  semesterId: text('semester_id'),
  jurusanId: text('jurusan_id'),
  jenisRombel: text('jenis_rombel'),
  namaJurusanSp: text('nama_jurusan_sp'),
  kurikulumId: text('kurikulum_id'), // Keeping as text for flexibility
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const siswa = pgTable('siswa', {
  id: uuid('id').defaultRandom().primaryKey(), // peserta_didik_id
  nis: text('nis'),
  nisn: text('nisn'),
  nama: text('nama').notNull(), // nm_siswa
  tempatLahir: text('tempat_lahir'),
  tanggalLahir: text('tanggal_lahir'),
  jenisKelamin: text('jenis_kelamin'),
  agama: text('agama'),
  alamatSiswa: text('alamat_siswa'),
  teleponSiswa: text('telepon_siswa'),
  diterimaTanggal: text('diterima_tanggal'),
  namaAyah: text('nm_ayah'),
  namaIbu: text('nm_ibu'),
  pekerjaanAyah: text('pekerjaan_ayah'),
  pekerjaanIbu: text('pekerjaan_ibu'),
  namaWali: text('nm_wali'),
  pekerjaanWali: text('pekerjaan_wali'),
  status: text('status').notNull().default('aktif'), // aktif, nonaktif, lulus, pindah
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const anggotaKelas = pgTable('anggota_kelas', {
  id: uuid('id').defaultRandom().primaryKey(), // anggota_rombel_id
  siswaId: uuid('siswa_id').references(() => siswa.id), // peserta_didik_id
  kelasId: uuid('kelas_id').references(() => kelas.id), // rombongan_belajar_id
  semesterId: text('semester_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const kelasEkskul = pgTable('kelas_ekskul', {
  id: uuid('id').defaultRandom().primaryKey(), // id_kelas_ekskul
  kelasId: uuid('kelas_id').references(() => kelas.id), // rombongan_belajar_id
  ekskulId: text('ekskul_id'), // id_ekskul (keeping as text if it's external ID)
  namaEkskul: text('nama_ekskul'), // nm_ekskul
  skEkskul: text('sk_ekskul'),
  tglSkEkskul: text('tgl_sk_ekskul'),
  jamKegiatanPerMinggu: text('jam_kegiatan_per_minggu'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const kelasRelations = relations(kelas, ({ one, many }) => ({
  waliKelas: one(guru, {
    fields: [kelas.waliKelasId],
    references: [guru.id],
  }),
  anggota: many(anggotaKelas),
  ekskul: many(kelasEkskul),
}))

export const guruRelations = relations(guru, ({ many }) => ({
  kelas: many(kelas),
}))

export const siswaRelations = relations(siswa, ({ many }) => ({
  anggotaKelas: many(anggotaKelas),
}))

export const anggotaKelasRelations = relations(anggotaKelas, ({ one }) => ({
  siswa: one(siswa, {
    fields: [anggotaKelas.siswaId],
    references: [siswa.id],
  }),
  kelas: one(kelas, {
    fields: [anggotaKelas.kelasId],
    references: [kelas.id],
  }),
}))

export const kelasEkskulRelations = relations(kelasEkskul, ({ one }) => ({
  kelas: one(kelas, {
    fields: [kelasEkskul.kelasId],
    references: [kelas.id],
  }),
}))

export const catatanWaliKelas = pgTable('catatan_wali_kelas', {
  id: uuid('id').defaultRandom().primaryKey(),
  siswaId: uuid('siswa_id').references(() => siswa.id, { onDelete: 'cascade' }),
  waliKelasId: uuid('wali_kelas_id').references(() => guru.id, { onDelete: 'cascade' }),
  kelasId: uuid('kelas_id').references(() => kelas.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id'),
  tahunAjaran: text('tahun_ajaran'),
  catatan: text('catatan').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const catatanWaliKelasRelations = relations(catatanWaliKelas, ({ one }) => ({
  siswa: one(siswa, {
    fields: [catatanWaliKelas.siswaId],
    references: [siswa.id],
  }),
  waliKelas: one(guru, {
    fields: [catatanWaliKelas.waliKelasId],
    references: [guru.id],
  }),
  kelas: one(kelas, {
    fields: [catatanWaliKelas.kelasId],
    references: [kelas.id],
  }),
}))

export const dokumen = pgTable('dokumen', {
  id: uuid('id').defaultRandom().primaryKey(),
  nama: text('nama').notNull(),
  deskripsi: text('deskripsi'),
  driveFileId: text('drive_file_id').notNull(),
  driveUrl: text('drive_url').notNull(),
  mimeType: text('mime_type'),
  ukuran: integer('ukuran'),
  uploaderId: text('uploader_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  kelasId: uuid('kelas_id').references(() => kelas.id, { onDelete: 'set null' }),
  kategori: text('kategori'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const dokumenRelations = relations(dokumen, ({ one }) => ({
  uploader: one(user, {
    fields: [dokumen.uploaderId],
    references: [user.id],
  }),
  kelas: one(kelas, {
    fields: [dokumen.kelasId],
    references: [kelas.id],
  }),
}))

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  siswaId: uuid('siswa_id').references(() => siswa.id, { onDelete: 'cascade' }),
  kelasId: uuid('kelas_id').references(() => kelas.id, { onDelete: 'cascade' }), // Rombel (Reguler atau Ekskul)
  tanggal: timestamp('tanggal').notNull().defaultNow(),
  status: text('status').notNull(), // Hadir, Izin, Sakit, Alfa
  keterangan: text('keterangan'),
  pembinaId: uuid('pembina_id').references(() => guru.id), // Siapa yang mengabsen
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const attendanceRelations = relations(attendance, ({ one }) => ({
  siswa: one(siswa, { fields: [attendance.siswaId], references: [siswa.id] }),
  kelas: one(kelas, { fields: [attendance.kelasId], references: [kelas.id] }),
  pembina: one(guru, { fields: [attendance.pembinaId], references: [guru.id] }),
}))
