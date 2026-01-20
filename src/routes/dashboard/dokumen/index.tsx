import { createFileRoute, Link } from '@tanstack/react-router';
import { getDokumens, getAdminDokumens, deleteDokumen } from '@/lib/server/dokumen';
import { processFileUpload } from '@/lib/server/drive';
import { getSession } from '@/lib/session';
import { useState, useMemo } from 'react';
import {
    Search,
    FileText,
    Plus,
    Trash2,
    Eye,
    Filter,
    User,
    Calendar,
    FileUp,
    Loader2,
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
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export const Route = createFileRoute('/dashboard/dokumen/')({
    loader: async () => {
        const session = await getSession();
        if (!session?.user?.id) return { documents: [], role: 'guest', userId: '' };

        const role = (session.user as any).role || 'guru';
        let documents = [];

        if (role === 'admin') {
            documents = await getAdminDokumens();
        } else {
            documents = await getDokumens({ data: { uploaderId: session.user.id } });
        }

        return { documents, role, userId: session.user.id };
    },
    component: DokumenPage,
})

const KATEGORI_LIST = [
    'Perangkat Pembelajaran',
    'Materi',
    'SK / Surat Tugas',
    'Laporan Peserta Didik',
    'Dokumentasi Kegiatan',
    'Lainnya'
];

function DokumenPage() {
    const { documents: initialDocuments, role, userId } = Route.useLoaderData();
    const [documents, setDocuments] = useState(initialDocuments);
    const [searchValue, setSearchValue] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('all');
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [deskripsi, setDeskripsi] = useState('');
    const [kategori, setKategori] = useState(KATEGORI_LIST[0]);
    const [isUploading, setIsUploading] = useState(false);

    // Preview State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    // Delete State
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc: any) => {
            const matchesSearch = doc.nama?.toLowerCase().includes(searchValue.toLowerCase()) ||
                doc.deskripsi?.toLowerCase().includes(searchValue.toLowerCase()) ||
                doc.uploader?.name?.toLowerCase().includes(searchValue.toLowerCase());
            const matchesKategori = kategoriFilter === 'all' || doc.kategori === kategoriFilter;
            return matchesSearch && matchesKategori;
        });
    }, [documents, searchValue, kategoriFilter]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Silakan pilih file terlebih dahulu.");
            return;
        }

        setIsUploading(true);
        try {
            // Step 1: Upload to Google Drive
            // Karena uploadFileToDrive adalah server function, kita bisa mengirim File object
            // Namun, dalam TanStack Start, server function yang menerima File biasanya perlu FormData
            // Tapi karena kita mendefinisikan uploadFileToDrive as regular async function in drive.ts (not createServerFn)
            // Kita butuh cara untuk memanggilnya. 
            // IDEALNYA: Kita buat server action / server function yang menerima FormData.

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('deskripsi', deskripsi);
            formData.append('kategori', kategori);
            formData.append('uploaderId', userId);

            // Kita butuh fungsi server yang membungkus logika upload drive + db save
            // Saya akan buat fungsi ini di lib/server/dokumen.ts nanti.
            // Untuk sekarang, saya akan asumsikan ada server function 'handleFileUpload'

            // SEBENARNYA: Kita bisa panggil uploadFileToDrive jika itu createServerFn.
            // Mari kita perbaiki drive.ts nanti untuk jadi createServerFn jika perlu, 
            // tapi saat ini mari gunakan pendekatan yang paling aman.

            toast.loading("Sedang mengunggah ke Google Drive...", { id: "upload-status" });

            // IMPLEMENTASI SEMENTARA: Kita butuh server function yang bisa handle File.
            // Saya akan panggil saveDokumenMetadata setelah simulasi/logic di server dokumen.ts

            const result = await processFileUpload({ data: formData });

            if (result) {
                toast.success("Dokumen berhasil diunggah.", { id: "upload-status" });
                setIsUploadOpen(false);
                setSelectedFile(null);
                setDeskripsi('');
                window.location.reload();
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Gagal mengunggah dokumen: " + error.message, { id: "upload-status" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!idToDelete) return;

        try {
            toast.loading("Menghapus dokumen...", { id: "delete-status" });
            await deleteDokumen({ data: idToDelete });
            setDocuments(documents.filter((d: any) => d.id !== idToDelete));
            toast.success("Dokumen berhasil dihapus.", { id: "delete-status" });
            setIsDeleteOpen(false);
            setIdToDelete(null);
        } catch (error) {
            toast.error("Terjadi kesalahan saat menghapus dokumen.", { id: "delete-status" });
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handlePreview = (doc: any) => {
        // Convert /view to /preview
        let url = doc.driveUrl;
        if (url.includes('/view')) {
            url = url.replace('/view', '/preview');
        } else if (!url.includes('/preview')) {
            // Jika link hanya ID atau format lain, minimal pastikan ada /preview
            // Namun drive.ts biasanya menghasilkan format /view
            url = url.split('?')[0] + '/preview';
        }

        setPreviewUrl(url);
        setPreviewTitle(doc.nama);
        setIsPreviewOpen(true);
    };

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
                        <BreadcrumbPage>Dokumen</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {role === 'admin' ? 'Monitoring Dokumen' : 'Dokumen Saya'}
                    </h1>
                    <p className="text-muted-foreground">
                        {role === 'admin'
                            ? 'Pantau semua dokumen yang diunggah oleh guru.'
                            : 'Kelola dokumen dan materi pembelajaran di Google Drive.'}
                    </p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Unggah Dokumen
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <CardTitle>Daftar Berkas</CardTitle>
                            <CardDescription>
                                Total {filteredDocuments.length} dokumen ditemukan.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau guru..."
                                    className="pl-8"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Kategori" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {KATEGORI_LIST.map(k => (
                                        <SelectItem key={k} value={k}>{k}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Nama Berkas</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    {role === 'admin' && <TableHead>Pengunggah</TableHead>}
                                    <TableHead className="hidden md:table-cell">Ukuran</TableHead>
                                    <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.length > 0 ? (
                                    filteredDocuments.map((doc: any) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm line-clamp-1">{doc.nama}</span>
                                                        <span className="text-xs text-muted-foreground line-clamp-1">{doc.deskripsi || '-'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Badge variant="secondary" className="font-normal">
                                                    {doc.kategori || 'Lainnya'}
                                                </Badge>
                                            </TableCell>
                                            {role === 'admin' && (
                                                <TableCell className="py-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{doc.uploader?.name}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground py-2">
                                                {formatBytes(doc.ukuran)}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell py-2">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-2">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(doc)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => {
                                                        setIdToDelete(doc.id);
                                                        setIsDeleteOpen(true);
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={role === 'admin' ? 6 : 5} className="h-32 text-center text-muted-foreground">
                                            Belum ada dokumen yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Unggah Dokumen Baru</DialogTitle>
                        <DialogDescription>
                            File akan disimpan di Google Drive. Maksimal ukuran file 10MB.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Pilih File</label>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                />
                                {selectedFile && (
                                    <p className="text-[10px] text-muted-foreground">
                                        Type: {selectedFile.type} | Size: {formatBytes(selectedFile.size)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Kategori</label>
                            <Select value={kategori} onValueChange={setKategori}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {KATEGORI_LIST.map(k => (
                                        <SelectItem key={k} value={k}>{k}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Deskripsi (Opsional)</label>
                            <Textarea
                                placeholder="Keterangan singkat mengenai dokumen ini..."
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
                            Batal
                        </Button>
                        <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="gap-2">
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Mengunggah...
                                </>
                            ) : (
                                <>
                                    <FileUp className="h-4 w-4" />
                                    Mulai Unggah
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog - Theater Mode (Edge-to-Edge) */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-[100vw] w-full h-[100vh] sm:max-w-[95vw] sm:h-[95vh] !p-0 !gap-0 flex flex-col overflow-hidden border-none bg-zinc-950 sm:rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] [&>button]:text-white [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:top-5 [&>button]:right-5 [&>button]:z-50 [&>button]:ring-offset-transparent">
                    {/* Header: Zero-Gap Professional Navigation */}
                    <div className="flex items-center justify-between px-6 h-16 bg-zinc-900 border-b border-white/5 shrink-0">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-sm sm:text-base text-zinc-100 truncate tracking-tight">
                                    {previewTitle}
                                </span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                    Google Drive Preview
                                </span>
                            </div>
                        </div>
                        {/* Shadow box for Close Button */}
                        <div className="w-12 h-full" />
                    </div>

                    {/* Content: Absolute Zero Padding */}
                    <div className="flex-1 w-full bg-zinc-900 overflow-hidden relative">
                        <iframe
                            src={previewUrl}
                            className="absolute inset-0 w-full h-full border-none"
                            allow="autoplay"
                            title="Document Preview"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Dokumen akan dihapus permanen dari sistem dan Google Drive.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIdToDelete(null)}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Ya, Hapus Permanen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
