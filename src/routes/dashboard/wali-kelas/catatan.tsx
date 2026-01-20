import { createFileRoute, Link } from '@tanstack/react-router';
import { getWaliKelasData } from '@/lib/server/kelas';
import { getCatatanWali, upsertCatatanWali, deleteCatatanWali } from '@/lib/server/catatan-wali';
import { getSession } from '@/lib/session';
import { useState, useMemo } from 'react';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
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
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/wali-kelas/catatan')({
    loader: async () => {
        const session = await getSession();
        if (!session?.user?.id) return { classData: null, catatans: [] };

        const classData = await getWaliKelasData({ data: session.user.id });
        if (!classData) return { classData: null, catatans: [] };

        const catatans = await getCatatanWali({
            data: {
                kelasId: classData.id,
                semesterId: classData.semesterId || undefined,
                tahunAjaran: classData.tahunAjaran || undefined
            }
        });

        return { classData, catatans };
    },
    component: CatatanWaliPage,
})

function CatatanWaliPage() {
    const { classData, catatans: initialCatatans } = Route.useLoaderData();
    const [catatans, setCatatans] = useState(initialCatatans);
    const [searchValue, setSearchValue] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCatatan, setEditingCatatan] = useState<any>(null);
    const [selectedSiswaId, setSelectedSiswaId] = useState('');
    const [catatanText, setCatatanText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const students = useMemo(() => {
        if (!classData?.anggota) return [];
        return classData.anggota
            .map((a: any) => a.siswa)
            .filter(Boolean)
            .sort((a: any, b: any) => (a.nama || "").localeCompare(b.nama || ""));
    }, [classData]);

    const filteredCatatans = useMemo(() => {
        if (!searchValue) return catatans;
        const search = searchValue.toLowerCase();
        return catatans.filter((c: any) =>
            c.siswa?.nama?.toLowerCase().includes(search) ||
            c.catatan?.toLowerCase().includes(search)
        );
    }, [catatans, searchValue]);

    const handleOpenAdd = () => {
        setEditingCatatan(null);
        setSelectedSiswaId('');
        setCatatanText('');
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (catatan: any) => {
        setEditingCatatan(catatan);
        setSelectedSiswaId(catatan.siswaId);
        setCatatanText(catatan.catatan);
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!selectedSiswaId || !catatanText) {
            toast.error("Pilih siswa dan isi catatan terlebih dahulu.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await upsertCatatanWali({
                data: {
                    id: editingCatatan?.id,
                    siswaId: selectedSiswaId,
                    waliKelasId: classData!.waliKelasId as string,
                    kelasId: classData!.id,
                    semesterId: classData!.semesterId || '',
                    tahunAjaran: classData!.tahunAjaran || '',
                    catatan: catatanText,
                }
            });

            if (result) {
                window.location.reload();
                toast.success("Catatan berhasil disimpan.");
                setIsDialogOpen(false);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat menyimpan catatan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus catatan ini?")) return;

        try {
            await deleteCatatanWali({ data: id });
            setCatatans(catatans.filter((c: any) => c.id !== id));
            toast.success("Catatan berhasil dihapus.");
        } catch (error) {
            toast.error("Terjadi kesalahan saat menghapus catatan.");
        }
    };

    if (!classData) {
        return <div className="p-8 text-center text-muted-foreground">Data kelas tidak ditemukan untuk tahun ajaran ini.</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/dashboard/wali-kelas">Data Kelas</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Catatan Siswa</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catatan Wali Kelas</h1>
                    <p className="text-muted-foreground">Berikan catatan atau umpan balik perkembangan untuk siswa Kelas {classData.nama}.</p>
                </div>
                <Button onClick={handleOpenAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Catatan
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>Daftar Catatan</CardTitle>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau isi catatan..."
                                className="pl-8"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Siswa</TableHead>
                                    <TableHead>Isi Catatan</TableHead>
                                    <TableHead className="w-[150px]">Tanggal</TableHead>
                                    <TableHead className="text-right w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCatatans.length > 0 ? (
                                    filteredCatatans.map((c: any) => (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary uppercase">
                                                            {c.siswa?.nama?.split(' ').map((n: any) => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-sm">{c.siswa?.nama}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <p className="text-sm text-balance">{c.catatan}</p>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(c.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(c)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                            Belum ada catatan untuk siswa di kelas ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingCatatan ? 'Edit Catatan' : 'Tambah Catatan Baru'}</DialogTitle>
                        <DialogDescription>
                            Tuliskan catatan perkembangan untuk siswa yang dipilih.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Pilih Siswa</label>
                            <Select
                                value={selectedSiswaId}
                                onValueChange={setSelectedSiswaId}
                                disabled={!!editingCatatan}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih siswa..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Isi Catatan</label>
                            <Textarea
                                placeholder="Tulis catatan di sini..."
                                className="min-h-[150px]"
                                value={catatanText}
                                onChange={(e) => setCatatanText(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
