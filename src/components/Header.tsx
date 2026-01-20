import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import {
  ChevronDown,
  ChevronRight,
  Database,
  Home,
  Menu,
  Network,
  SquareFunction,
  StickyNote,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [groupedExpanded, setGroupedExpanded] = useState<
    Record<string, boolean>
  >({})

  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsOpen(false)
          navigate({ to: '/login' })
        },
      },
    })
  }

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg sticky top-0 z-40">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">
              <img
                src="/tanstack-word-logo-white.svg"
                alt="TanStack Logo"
                className="h-8"
              />
            </Link>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {!isPending && session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{session.user.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-700 overflow-hidden">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
            </div>
          ) : !isPending && (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Masuk
            </Link>
          )}
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">AKSIS</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/50 mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Halaman Utama</span>
          </Link>

          {session && (
            <>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-4 mb-2 ml-3">
                Menu Management
              </div>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    'flex items-center gap-3 p-3 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/50 mb-2',
                }}
              >
                <Database size={20} />
                <span className="font-medium">Dashboard Overview</span>
              </Link>
            </>
          )}

          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-4 mb-2 ml-3">
            Developer Demos
          </div>

          <Link
            to="/demo/start/server-funcs"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700 mb-2',
            }}
          >
            <SquareFunction size={20} />
            <span className="font-medium">Server Functions</span>
          </Link>

          <Link
            to="/demo/start/api-request"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
          >
            <Network size={20} />
            <span className="font-medium">API Request</span>
          </Link>

          <Link
            to="/demo/neon"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
          >
            <Database size={20} />
            <span className="font-medium">Neon DB</span>
          </Link>

          <Link
            to="/demo/drizzle"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
          >
            <Database size={20} />
            <span className="font-medium">Drizzle ORM</span>
          </Link>
        </nav>

        {session && (
          <div className="p-4 border-t border-gray-700 bg-gray-900/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all font-semibold"
            >
              <LogOut size={20} />
              Keluar Sistem
            </button>
          </div>
        )}
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
