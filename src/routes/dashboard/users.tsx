import { createFileRoute, Link } from '@tanstack/react-router';
import { getUsers, updateUserRole, resetUserPassword, toggleUserActive } from '@/lib/server/users';
import { useState, useMemo } from 'react';
import {
    Search,
    Users,
    UserCheck,
    UserX,
    Shield,
    Key,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
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
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
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

export const Route = createFileRoute('/dashboard/users')({
    loader: async () => await getUsers({ data: {} }),
    component: UsersPage,
})

function UsersPage() {
    const allUsers = Route.useLoaderData();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newRole, setNewRole] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const pageSize = 10;

    const filteredUsers = useMemo(() => {
        if (!searchValue) return allUsers;
        const search = searchValue.toLowerCase();
        return allUsers.filter((u: any) =>
            u.name?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search) ||
            u.username?.toLowerCase().includes(search)
        );
    }, [allUsers, searchValue]);

    const totalFiltered = filteredUsers.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, page, pageSize]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const openRoleDialog = (user: any) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsRoleDialogOpen(true);
    };

    const openPasswordDialog = (user: any) => {
        setSelectedUser(user);
        setNewPassword('');
        setIsPasswordDialogOpen(true);
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;
        setIsLoading(true);
        try {
            await updateUserRole({ data: { userId: selectedUser.id, role: newRole as any } });
            toast.success('Role berhasil diperbarui');
            setIsRoleDialogOpen(false);
            window.location.reload();
        } catch (error) {
            toast.error('Gagal memperbarui role');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return;
        if (newPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }
        setIsLoading(true);
        try {
            await resetUserPassword({ data: { userId: selectedUser.id, newPassword } });
            toast.success('Password berhasil direset');
            setIsPasswordDialogOpen(false);
        } catch (error) {
            toast.error('Gagal reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (user: any) => {
        try {
            await toggleUserActive({ data: { userId: user.id, isActive: !user.isActive } });
            toast.success(user.isActive ? 'User dinonaktifkan' : 'User diaktifkan');
            window.location.reload();
        } catch (error) {
            toast.error('Gagal mengubah status user');
        }
    };

    const totalCount = allUsers.length;
    const activeCount = allUsers.filter((u: any) => u.isActive).length;
    const adminCount = allUsers.filter((u: any) => u.role === 'admin').length;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700 border-red-200';
            case 'guru': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pembina': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
                        <BreadcrumbPage>Manajemen User</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
                    <p className="text-muted-foreground">Kelola akun pengguna, role, dan password.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total User</CardTitle>
                        <Users className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">User Aktif</CardTitle>
                        <UserCheck className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Admin</CardTitle>
                        <Shield className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{adminCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Daftar User</CardTitle>
                            <CardDescription>Menampilkan {paginatedUsers.length} dari {totalFiltered} user.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, email, username..."
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
                                    <TableHead className="w-[60px]">Avatar</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.length > 0 ? paginatedUsers.map((user: any) => {
                                    const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Avatar className="h-9 w-9 border">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                            <TableCell className="font-mono text-sm">{user.username || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.isActive ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Nonaktif
                                                    </Badge>
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
                                                        <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Ubah Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                                                            <Key className="mr-2 h-4 w-4" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                                                            {user.isActive ? (
                                                                <>
                                                                    <UserX className="mr-2 h-4 w-4" />
                                                                    Nonaktifkan
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                                    Aktifkan
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Tidak ada user ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="flex items-center justify-between px-6 pb-6">
                    <div className="text-sm text-muted-foreground">
                        Halaman {page} dari {totalPages || 1}
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
            </Card>

            {/* Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Role User</DialogTitle>
                        <DialogDescription>
                            Ubah role untuk {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Role</Label>
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="guru">Guru</SelectItem>
                                <SelectItem value="pembina">Pembina</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleUpdateRole} disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Reset password untuk {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Password Baru</Label>
                        <div className="relative mt-2">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password baru"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Minimal 6 karakter</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleResetPassword} disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : 'Reset Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
