import { createFileRoute, Link } from '@tanstack/react-router';
import { getWaliKelasData } from '@/lib/server/kelas';
import { getSession } from '@/lib/session';
import { useState, useMemo } from 'react';
import {
    Search,
    Users,
    School,
} from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export const Route = createFileRoute('/dashboard/wali-kelas/')({
    loader: async () => {
        const session = await getSession();
        if (!session?.user?.id) return { classData: null, userRole: null };

        const classData = await getWaliKelasData({ data: session.user.id });
        return { classData };
    },
    component: WaliKelasPage,
})

function WaliKelasPage() {
    const { classData } = Route.useLoaderData();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);

    const pageSize = 10;

    const students = useMemo(() => {
        if (!classData?.anggota) return [];
        return classData.anggota
            .map((a: any) => ({
                ...a.siswa,
                anggotaKelas: a.siswa?.anggotaKelas || []
            }))
            .filter((s: any) => s.id)
            .sort((a: any, b: any) =>
                (a.nama || '').localeCompare(b.nama || '', 'id', { numeric: true, sensitivity: 'base' })
            );
    }, [classData]);

    const stats = useMemo(() => {
        return {
            total: students.length,
            male: students.filter((s: any) => s.jenisKelamin?.toUpperCase() === 'L').length,
            female: students.filter((s: any) => s.jenisKelamin?.toUpperCase() === 'P').length,
        };
    }, [students]);

    const filteredStudents = useMemo(() => {
        if (!searchValue) return students;
        const search = searchValue.toLowerCase();
        return students.filter((s: any) =>
            s.nama?.toLowerCase().includes(search) ||
            s.nis?.includes(search) ||
            s.nisn?.includes(search)
        );
    }, [students, searchValue]);

    const totalFiltered = filteredStudents.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const paginatedStudents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, page, pageSize]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (!classData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="p-6 bg-muted rounded-full">
                    <School className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Data Kelas Tidak Ditemukan</h2>
                    <p className="text-muted-foreground">Anda belum terdaftar sebagai Wali Kelas atau Pembina di tahun ajaran ini.</p>
                </div>
                <Link
                    to="/dashboard"
                    className="mt-4 px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
                >
                    Kembali ke Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 bg-slate-50/30 min-h-screen">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Data Kelas</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-md shadow-sm border border-border">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/5">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {classData.nama}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tahun Ajaran {classData.tahunAjaran} • Semester {classData.semesterId}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary shadow-sm rounded-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">Total Siswa</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">Siswa aktif terdaftar</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm rounded-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-blue-600">Laki-laki (L)</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.male}</div>
                        <p className="text-xs text-muted-foreground mt-1">Siswa putra</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-pink-500 shadow-sm rounded-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-pink-600">Perempuan (P)</CardTitle>
                        <Users className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.female}</div>
                        <p className="text-xs text-muted-foreground mt-1">Siswa putri</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm rounded-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase text-emerald-600">Status Kelas</CardTitle>
                        <School className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">Aktif</div>
                        <p className="text-xs text-muted-foreground mt-1">Periode berjalan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-white/50 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold">Daftar Siswa Kelas</CardTitle>
                            <CardDescription>
                                Menampilkan {paginatedStudents.length} dari {totalFiltered} siswa.
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau NIS..."
                                className="pl-9 bg-muted/20 focus:bg-background border-border"
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                                    <TableHead className="w-[70px] pl-6 py-4">Siswa</TableHead>
                                    <TableHead className="py-4">Nama</TableHead>
                                    <TableHead className="py-4">NIS</TableHead>
                                    <TableHead className="py-4 text-center">L/P</TableHead>
                                    <TableHead className="py-4">Kelas Reguler</TableHead>
                                    <TableHead className="py-4 pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((siswa: any) => {
                                        const initials = siswa.nama?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                                        return (
                                            <TableRow key={siswa.id} className="hover:bg-muted/10 border-b border-border/40">
                                                <TableCell className="pl-6">
                                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-foreground leading-none">{siswa.nama}</div>
                                                    <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                                                        {siswa.tempatLahir}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs">{siswa.nis || "-"}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={`font-mono border-none h-6 ${siswa.jenisKelamin?.toUpperCase() === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                        {siswa.jenisKelamin || '?'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {siswa.anggotaKelas?.filter((ak: any) =>
                                                            ak.kelas?.jenisRombel === '1' || ak.kelas?.jenisRombel === '9'
                                                        ).map((ak: any, idx: number) => (
                                                            <Badge key={idx} variant="secondary" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                                                                {ak.kelas?.nama}
                                                            </Badge>
                                                        )) || <span className="text-xs text-muted-foreground italic">N/A</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-6">
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">Aktif</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Users className="h-10 w-10 opacity-10" />
                                                <p className="text-sm">Data tidak ditemukan.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-border">
                        {paginatedStudents.length > 0 ? (
                            paginatedStudents.map((siswa: any) => {
                                const initials = siswa.nama?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                                return (
                                    <div key={siswa.id} className="p-4 flex gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm flex-shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-semibold text-foreground truncate">{siswa.nama}</div>
                                                <Badge variant="outline" className={`font-mono border-none h-5 text-[10px] flex-shrink-0 ${siswa.jenisKelamin?.toUpperCase() === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                    {siswa.jenisKelamin || '?'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-mono text-xs text-muted-foreground">{siswa.nis || "-"}</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-xs text-muted-foreground truncate">{siswa.tempatLahir}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                {siswa.anggotaKelas?.filter((ak: any) =>
                                                    ak.kelas?.jenisRombel === '1' || ak.kelas?.jenisRombel === '9'
                                                ).map((ak: any, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className="text-[10px] bg-slate-100 border-slate-200 text-slate-700">
                                                        {ak.kelas?.nama}
                                                    </Badge>
                                                ))}
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">Aktif</Badge>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Users className="h-10 w-10 opacity-10" />
                                    <p className="text-sm">Data tidak ditemukan.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="p-4 border-t border-border/50 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="text-xs text-muted-foreground">
                            Menampilkan <strong>{(page - 1) * pageSize + 1}</strong> - <strong>{Math.min(page * pageSize, totalFiltered)}</strong> dari <strong>{totalFiltered}</strong> siswa
                        </div>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(page - 1)}
                                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(page + 1)}
                                        className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </Card>
        </div>
    );
}
