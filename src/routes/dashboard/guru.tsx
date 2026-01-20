import { createFileRoute, Link } from '@tanstack/react-router';
import { getGurus } from '@/lib/server/guru';
import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  LayoutGrid,
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

export const Route = createFileRoute('/dashboard/guru')({
  loader: async () => await getGurus(),
  component: GuruPage,
})

function GuruPage() {
  const allGurus = Route.useLoaderData();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Client-side filtering
  const filteredGurus = useMemo(() => {
    if (!searchValue) return allGurus;
    const search = searchValue.toLowerCase();
    return allGurus.filter((g: any) =>
      g.nama?.toLowerCase().includes(search) ||
      g.nip?.includes(search) ||
      g.nuptk?.includes(search)
    );
  }, [allGurus, searchValue]);

  // Client-side pagination
  const totalFiltered = filteredGurus.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const paginatedGurus = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredGurus.slice(start, start + pageSize);
  }, [filteredGurus, page, pageSize]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const totalCount = allGurus.length;
  const activeCount = allGurus.filter((g: any) => g.statusKeaktifanId !== '3').length;

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
            <BreadcrumbPage>Database Guru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Guru</h1>
          <p className="text-muted-foreground">Kelola data pendidik dan tenaga kependidikan (PTK).</p>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Tambah Guru
        </Button>
      </div>

      {/* Stats Cards - Modern Premium Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Guru</CardTitle>
            <div className="rounded-full bg-white/20 p-2">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCount}</div>
            <p className="text-xs text-white/70 mt-1">Dalam database</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Guru Aktif</CardTitle>
            <div className="rounded-full bg-white/20 p-2">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
            <p className="text-xs text-white/70 mt-1">Status aktif</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Hasil Filter</CardTitle>
            <div className="rounded-full bg-white/20 p-2">
              <Search className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFiltered}</div>
            <p className="text-xs text-white/70 mt-1">{searchValue ? 'Terfilter' : 'Semua data'}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Halaman</CardTitle>
            <div className="rounded-full bg-white/20 p-2">
              <LayoutGrid className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{page} / {totalPages || 1}</div>
            <p className="text-xs text-white/70 mt-1">Navigasi data</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Guru</CardTitle>
              <CardDescription>Menampilkan {paginatedGurus.length} dari {totalFiltered} guru{searchValue && ' (terfilter)'}.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIP, atau NUPTK..."
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
                  <TableHead>NIP</TableHead>
                  <TableHead>NUPTK</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>Jenis PTK</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGurus.length > 0 ? paginatedGurus.map((guru: any) => {
                  const initials = guru.nama?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

                  return (
                    <TableRow key={guru.id}>
                      <TableCell>
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback className="bg-cyan-500/10 text-cyan-600 text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{guru.nama}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {guru.tempatLahir}, {guru.tanggalLahir}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{guru.nip || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{guru.nuptk || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {guru.jenisKelamin || '?'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {guru.jenisPtkId === '92' ? 'Guru Mapel' : 'Tendik'}
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
                              Hapus Guru
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada data guru ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 px-6 pb-6 mt-4">
          <div className="text-sm text-muted-foreground order-2 md:order-1 md:mr-auto">
            Menampilkan <strong>{(page - 1) * pageSize + 1}</strong> hingga <strong>{Math.min(page * pageSize, totalFiltered)}</strong> dari <strong>{totalFiltered}</strong> guru
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
    </div>
  );
}
