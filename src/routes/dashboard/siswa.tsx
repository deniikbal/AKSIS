import { createFileRoute, Link } from '@tanstack/react-router';
import { getSiswas, getSiswasCount } from '@/lib/server/siswa';
import { getAnggotaKelas } from '@/lib/server/anggota-kelas';
import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GraduationCap,
  LayoutGrid,
  Users,
  UserCheck,
  MoreHorizontal,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Route = createFileRoute('/dashboard/siswa')({
  loader: async () => {
    const [siswas, totalCount, anggota] = await Promise.all([
      getSiswas({ data: {} }),
      getSiswasCount({ data: {} }),
      getAnggotaKelas(),
    ]);
    return { siswas, totalCount, anggota };
  },
  component: SiswaPage,
})

function SiswaPage() {
  const { siswas: allSiswas, totalCount, anggota } = Route.useLoaderData();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Client-side filtering
  const filteredSiswas = useMemo(() => {
    if (!searchValue) return allSiswas;
    const search = searchValue.toLowerCase();
    return allSiswas.filter((s: any) =>
      s.nama?.toLowerCase().includes(search) ||
      s.nis?.includes(search) ||
      s.nisn?.includes(search)
    );
  }, [allSiswas, searchValue]);

  // Client-side pagination
  const totalFiltered = filteredSiswas.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const paginatedSiswas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSiswas.slice(start, start + pageSize);
  }, [filteredSiswas, page, pageSize]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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
            <BreadcrumbPage>Database Siswa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Siswa</h1>
          <p className="text-muted-foreground">Kelola data peserta didik dan penempatan kelas.</p>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Registrasi Siswa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Tentu saja dalam database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siswa Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSiswas.filter((s: any) => s.status === 'aktif').length}</div>
            <p className="text-xs text-muted-foreground">Dari seluruh data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penempatan Kelas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anggota.length}</div>
            <p className="text-xs text-muted-foreground">Total records penempatan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{page} / {totalPages || 1}</div>
            <p className="text-xs text-muted-foreground">Navigasi data</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>Menampilkan {paginatedSiswas.length} dari {totalFiltered} siswa{searchValue && ' (terfilter)'}.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIS..."
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
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>NIS / NISN</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSiswas.length > 0 ? paginatedSiswas.map((siswa: any) => {
                  const classMemberships = anggota?.filter((a: any) =>
                    a.siswaId === siswa.id &&
                    (a.kelas?.jenisRombel === '1' || a.kelas?.jenisRombel === '9')
                  ) || [];
                  const initials = siswa.nama?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                  return (
                    <TableRow key={siswa.id}>
                      <TableCell>
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{siswa.nama}</div>
                        <div className="text-xs text-muted-foreground md:hidden lg:block truncate max-w-[200px]">
                          {siswa.tempatLahir}, {siswa.tanggalLahir}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{siswa.nis || '-'}</div>
                        <div className="text-[10px] text-muted-foreground">{siswa.nisn || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {siswa.jenisKelamin || '?'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {classMemberships.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {classMemberships.map((m: any) => (
                              <Badge key={m.id} variant="secondary" className="text-[10px]">
                                {m.kelas?.nama}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Belum Ada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={siswa.status === 'aktif' ? 'default' : 'secondary'} className="capitalize">
                          {siswa.status}
                        </Badge>
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
                              Hapus Siswa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada data siswa ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 px-6 pb-6 mt-4">
          <div className="text-sm text-muted-foreground order-2 md:order-1 md:mr-auto">
            Menampilkan <strong>{(page - 1) * pageSize + 1}</strong> hingga <strong>{Math.min(page * pageSize, totalFiltered)}</strong> dari <strong>{totalFiltered}</strong> siswa
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
                // Simple logic to show current, first, last, and around current
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
              }).filter(Boolean).filter((item, index, self) => {
                // Filter out multiple ellipses
                if (item?.type === PaginationEllipsis && self[index - 1]?.type === PaginationEllipsis) return false;
                return true;
              })}

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
    </div>
  );
}
