import { Link } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Users,
    School,
    GraduationCap,
    LogOut,
    ChevronRight,
    Stethoscope
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function Sidebar() {
    const { data: session } = authClient.useSession();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
        { label: 'Data Guru', icon: Users, to: '/dashboard/guru', roles: ['admin'] },
        { label: 'Data Kelas', icon: School, to: '/dashboard/kelas', roles: ['admin', 'guru'] },
        { label: 'Data Siswa', icon: GraduationCap, to: '/dashboard/siswa', roles: ['admin', 'guru', 'pembina'] },
    ];

    const filteredItems = menuItems.filter(item =>
        !item.roles || (session?.user?.role && item.roles.includes(session.user.role))
    );

    return (
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                    <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight">AKSIS</h1>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Aplikasi Kesiswaan</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                {filteredItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-slate-400 font-medium transition-all group"
                        activeProps={{
                            className: "flex items-center justify-between p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-semibold transition-all shadow-lg shadow-blue-900/10"
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="p-4 bg-slate-800/50 rounded-2xl mb-4 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 overflow-hidden border border-slate-600">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="" />
                            ) : (
                                session?.user?.name?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{session?.user?.role}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => window.location.href = '/' } })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar Sesi</span>
                </button>
            </div>
        </aside>
    );
}
