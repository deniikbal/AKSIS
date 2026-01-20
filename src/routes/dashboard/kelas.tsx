import { createFileRoute, Link } from '@tanstack/react-router';
import { getKelas } from '@/lib/server/kelas';
import { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    School,
    LayoutGrid,
    MoreHorizontal,
    BookOpen,
    Sparkles,
    Users,
    Users2,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Route = createFileRoute('/dashboard/kelas')({
    loader: async () => await getKelas(),
    component: KelasPage,
})

type TabType = 'reguler' | 'ekskul' | 'pilihan';

function KelasPage() {
    const allKelas = Route.useLoaderData();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>('reguler');
    const [selectedKelas, setSelectedKelas] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [studentSearchValue, setStudentSearchValue] = useState('');
    const pageSize = 10;

    // Group classes by jenis_rombel
    const regulerKelas = useMemo(() =>
        allKelas
            .filter((k: any) => k.jenisRombel === '1' || k.jenisRombel === '9')
            .sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '', undefined, { numeric: true })),
        [allKelas]
    );
    const ekskulKelas = useMemo(() =>
        allKelas
            .filter((k: any) => k.jenisRombel === '51')
            .sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '', undefined, { numeric: true })),
        [allKelas]
    );
    const pilihanKelas = useMemo(() =>
        allKelas
            .filter((k: any) => !['1', '9', '51'].includes(k.jenisRombel))
            .sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '', undefined, { numeric: true })),
        [allKelas]
    );

    // Get data based on active tab
    const currentTabData = useMemo(() => {
        switch (activeTab) {
            case 'reguler': return regulerKelas;
            case 'ekskul': return ekskulKelas;
            case 'pilihan': return pilihanKelas;
            default: return regulerKelas;
        }
    }, [activeTab, regulerKelas, ekskulKelas, pilihanKelas]);

    // Client-side filtering
    const filteredKelas = useMemo(() => {
        if (!searchValue) return currentTabData;
        const search = searchValue.toLowerCase();
        return currentTabData.filter((k: any) =>
            k.nama?.toLowerCase().includes(search) ||
            k.namaJurusanSp?.toLowerCase().includes(search) ||
            k.tingkat?.includes(search)
        );
    }, [currentTabData, searchValue]);

    // Client-side pagination
    const totalFiltered = filteredKelas.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const paginatedKelas = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredKelas.slice(start, start + pageSize);
    }, [filteredKelas, page, pageSize]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setPage(1);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value as TabType);
        setPage(1);
        setSearchValue('');
    };

    // Sort and filter students in the selected class
    const sortedStudents = useMemo(() => {
        if (!selectedKelas?.anggota) return [];

        // Filter by search
        let filtered = selectedKelas.anggota;
        if (studentSearchValue) {
            const search = studentSearchValue.toLowerCase();
            filtered = filtered.filter((a: any) =>
                a.siswa?.nama?.toLowerCase().includes(search) ||
                a.siswa?.nis?.includes(search)
            );
        }

        // Sort alphabetically
        return [...filtered].sort((a: any, b: any) =>
            (a.siswa?.nama || '').localeCompare(b.siswa?.nama || '')
        );
    }, [selectedKelas, studentSearchValue]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const totalCount = allKelas.length;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
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
                        <BreadcrumbPage>Database Kelas</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Database Kelas</h1>
                    <p className="text-muted-foreground">Kelola rombongan belajar dan kurikulum.</p>
                </div>
                <Button className="w-full md:w-auto gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Kelas
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                        <p className="text-xs text-muted-foreground">Semua rombel</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kelas Reguler</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{regulerKelas.length}</div>
                        <p className="text-xs text-muted-foreground">Jenis rombel 1 & 9</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ekstrakurikuler</CardTitle>
                        <Sparkles className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ekskulKelas.length}</div>
                        <p className="text-xs text-muted-foreground">Jenis rombel 51</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kelas Pilihan</CardTitle>
                        <LayoutGrid className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pilihanKelas.length}</div>
                        <p className="text-xs text-muted-foreground">Jenis rombel lainnya</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs & Table Section */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="reguler" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Reguler ({regulerKelas.length})
                    </TabsTrigger>
                    <TabsTrigger value="ekskul" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Ekskul ({ekskulKelas.length})
                    </TabsTrigger>
                    <TabsTrigger value="pilihan" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Pilihan ({pilihanKelas.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>
                                        Daftar Kelas {activeTab === 'reguler' ? 'Reguler' : activeTab === 'ekskul' ? 'Ekstrakurikuler' : 'Pilihan'}
                                    </CardTitle>
                                    <CardDescription>Menampilkan {paginatedKelas.length} dari {totalFiltered} kelas{searchValue && ' (terfilter)'}.</CardDescription>
                                </div>
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama kelas atau jurusan..."
                                        className="pl-8"
                                        value={searchValue}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Nama Kelas</TableHead>
                                            <TableHead>Tingkat</TableHead>
                                            <TableHead>Jurusan</TableHead>
                                            <TableHead>Jenis Rombel</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Jumlah Siswa</TableHead>
                                            <TableHead>Wali Kelas</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedKelas.length > 0 ? paginatedKelas.map((kelas: any) => {
                                            return (
                                                <TableRow key={kelas.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{kelas.nama}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {kelas.tahunAjaran || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{kelas.tingkat || '-'}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{kelas.namaJurusanSp || 'Umum'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={kelas.jenisRombel === '1' || kelas.jenisRombel === '9' ? 'default' : kelas.jenisRombel === '51' ? 'secondary' : 'outline'} className="text-[10px]">
                                                            {kelas.jenisRombel === '1' ? 'Reguler' : kelas.jenisRombel === '9' ? 'Reguler 9' : kelas.jenisRombel === '51' ? 'Ekskul' : `Tipe ${kelas.jenisRombel}`}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm font-mono">{kelas.semesterId || '-'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2 h-8 hover:bg-muted"
                                                            onClick={() => {
                                                                setSelectedKelas(kelas);
                                                                setIsSheetOpen(true);
                                                            }}
                                                        >
                                                            <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="font-semibold">{kelas.anggota?.length || 0}</span>
                                                            <span className="text-xs text-muted-foreground font-normal">Siswa</span>
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        {kelas.waliKelas ? (
                                                            <div className="text-sm">{kelas.waliKelas.nama}</div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">Belum Ada</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit Data
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Hapus Kelas
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center">
                                                    Tidak ada data kelas ditemukan.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 px-6 pb-6 mt-4">
                            <div className="text-sm text-muted-foreground order-2 md:order-1 md:mr-auto">
                                Menampilkan <strong>{totalFiltered > 0 ? (page - 1) * pageSize + 1 : 0}</strong> hingga <strong>{Math.min(page * pageSize, totalFiltered)}</strong> dari <strong>{totalFiltered}</strong> kelas
                            </div>
                            <Pagination className="order-1 md:order-2 mx-0 w-auto">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(page - 1)}
                                            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {[...Array(totalPages)].map((_, i) => {
                                        const p = i + 1;
                                        if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                            return (
                                                <PaginationItem key={p}>
                                                    <PaginationLink
                                                        isActive={p === page}
                                                        onClick={() => handlePageChange(p)}
                                                        className="cursor-pointer"
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        }
                                        if (p === 2 || p === totalPages - 1) {
                                            return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                                        }
                                        return null;
                                    }).filter(Boolean)}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => handlePageChange(page + 1)}
                                            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Student List Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => {
                setIsSheetOpen(open);
                if (!open) setStudentSearchValue(''); // Reset search on close
            }}>
                <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
                    <SheetHeader className="p-6 pb-2">
                        <SheetTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Daftar Siswa
                        </SheetTitle>
                        <SheetDescription>
                            Kelas {selectedKelas?.nama} • {selectedKelas?.anggota?.length || 0} Siswa
                        </SheetDescription>

                        <div className="relative mt-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau NIS..."
                                className="pl-8 h-9"
                                value={studentSearchValue}
                                onChange={(e) => setStudentSearchValue(e.target.value)}
                            />
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 px-6">
                        <div className="space-y-3 pb-6 mt-2">
                            {sortedStudents.length > 0 ? (
                                sortedStudents.map((a: any) => (
                                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 text-left">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.siswa?.nama}`} />
                                                <AvatarFallback>{a.siswa?.nama?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-0.5">
                                                <div className="text-sm font-medium leading-none">{a.siswa?.nama}</div>
                                                <div className="text-xs text-muted-foreground">NIS: {a.siswa?.nis || '-'}</div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] h-5 capitalize">
                                            {a.siswa?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Users2 className="h-10 w-10 opacity-20 mb-2" />
                                    <p className="text-sm font-medium">Siswa tidak ditemukan</p>
                                    <p className="text-xs">Coba cari dengan nama atau NIS lain.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}
