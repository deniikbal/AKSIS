"use client"

import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import {
    Home,
    Users,
    GraduationCap,
    School,
    LogOut,
    ChevronUp,
    ChevronRight,
    Settings,
    Database,
    FileText,
    ClipboardCheck,
    ClipboardList,
} from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'

export function AppSidebar() {
    const { data: session } = authClient.useSession()
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = location.pathname
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return currentPath === '/dashboard'
        }
        return currentPath.startsWith(path)
    }

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate({ to: '/login' })
                },
            },
        })
    }

    const userInitials = session?.user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'


    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border h-14 justify-center px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <School className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-base leading-none">AKSIS</span>
                        <span className="text-[10px] text-muted-foreground truncate">Sistem Informasi Sekolah</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Dashboard */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                                    <Link to="/dashboard">
                                        <Home />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Dynamic Content - Admin / Guru / Pembina */}
                            {mounted && (session?.user as any)?.role === 'admin' && (
                                <>
                                    {/* Data Referensi - Collapsible */}
                                    <Collapsible
                                        defaultOpen={currentPath.startsWith('/dashboard/siswa') || currentPath.startsWith('/dashboard/guru') || currentPath.startsWith('/dashboard/kelas') || currentPath.startsWith('/dashboard/dokumen') || currentPath.startsWith('/dashboard/users')}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton isActive={currentPath.startsWith('/dashboard/') && !isActive('/dashboard')}>
                                                    <Database />
                                                    <span>Data Referensi</span>
                                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton asChild isActive={isActive('/dashboard/siswa')}>
                                                            <Link to="/dashboard/siswa">
                                                                <GraduationCap />
                                                                <span>Data Siswa</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton asChild isActive={isActive('/dashboard/guru')}>
                                                            <Link to="/dashboard/guru">
                                                                <Users />
                                                                <span>Data Guru</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton asChild isActive={isActive('/dashboard/kelas')}>
                                                            <Link to="/dashboard/kelas">
                                                                <School />
                                                                <span>Data Kelas</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton asChild isActive={isActive('/dashboard/users')}>
                                                            <Link to="/dashboard/users">
                                                                <Users />
                                                                <span>Manajemen User</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>

                                    {/* Data Dokumen - Top Level for Admin */}
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/dashboard/dokumen')}>
                                            <Link to="/dashboard/dokumen">
                                                <FileText />
                                                <span>Data Dokumen</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}

                            {/* Menu for Guru/Wali Kelas */}
                            {mounted && ((session?.user as any)?.role === 'guru' || (session?.user as any)?.role === 'pembina') && (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/dashboard/wali-kelas') && currentPath === '/dashboard/wali-kelas'}>
                                            <Link to="/dashboard/wali-kelas">
                                                <School className="w-4 h-4" />
                                                <span>Data Perwalian</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/dashboard/wali-kelas/catatan')}>
                                            <Link to="/dashboard/wali-kelas/catatan">
                                                <ClipboardList className="w-4 h-4" />
                                                <span>Catatan Siswa</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive('/dashboard/dokumen')}>
                                            <Link to="/dashboard/dokumen">
                                                <FileText className="w-4 h-4" />
                                                <span>Dokumen Saya</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}

                            {/* Menu Absensi for Pembina - at bottom */}
                            {mounted && (session?.user as any)?.role === 'pembina' && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive('/dashboard/wali-kelas/absensi')}>
                                        <Link to="/dashboard/wali-kelas/absensi">
                                            <ClipboardCheck className="w-4 h-4" />
                                            <span>Absensi Ekskul</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border h-16">
                {mounted && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton size="lg" className="w-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session?.user?.image || undefined} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-sm font-medium truncate max-w-[120px]">
                                                {session?.user?.name || 'User'}
                                            </span>
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {(session?.user as any)?.role || 'Guest'}
                                            </span>
                                        </div>
                                        <ChevronUp className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-popper-anchor-width]"
                                >
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Pengaturan
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
