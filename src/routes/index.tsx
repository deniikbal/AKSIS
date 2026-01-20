import { createFileRoute, Link } from '@tanstack/react-router';
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  BookOpen,
  Bell,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  const features = [
    {
      icon: ClipboardCheck,
      title: 'Absensi Digital',
      description: 'Pencatatan kehadiran siswa secara real-time dengan teknologi modern',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Users,
      title: 'Manajemen Siswa',
      description: 'Kelola data siswa dengan mudah dan terstruktur dalam satu platform',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: BarChart3,
      title: 'Laporan Komprehensif',
      description: 'Analisis data kehadiran dan perilaku siswa dengan visualisasi lengkap',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Bell,
      title: 'Notifikasi Otomatis',
      description: 'Pemberitahuan real-time ke orang tua via WhatsApp',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: Calendar,
      title: 'Jadwal Pembelajaran',
      description: 'Kelola jadwal pelajaran dan jurnal pembelajaran harian',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Catatan Wali Kelas',
      description: 'Dokumentasi perkembangan siswa oleh wali kelas',
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-gradient-to-br from-emerald-500/15 to-teal-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">AKSIS</h1>
              <p className="text-[10px] text-slate-400 leading-tight">SMAN 1 BANTARUJEG</p>
            </div>
          </div>

          <Link to="/login">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105">
              Masuk
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full mb-8">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Sistem Informasi Terpadu</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AKSIS
            </span>
          </h1>

          <h2 className="text-xl md:text-2xl font-medium text-slate-300 mb-4 max-w-2xl mx-auto">
            Aplikasi Kesiswaan dan Sistem Informasi Sekolah
          </h2>

          <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto">
            Platform digital terpadu untuk manajemen kehadiran, perilaku, dan perkembangan siswa di era modern
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-6 text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 rounded-xl">
                <GraduationCap className="w-5 h-5 mr-2" />
                Mulai Sekarang
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 py-6 text-lg rounded-xl transition-all duration-300">
              Pelajari Lebih Lanjut
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: '1000+', label: 'Siswa Aktif' },
              { value: '50+', label: 'Guru & Staff' },
              { value: '36', label: 'Kelas' },
              { value: '99%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Solusi lengkap untuk digitalisasi manajemen kesiswaan di sekolah Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:border-cyan-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-[80px] rounded-full" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Siap Memulai?
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Akses sistem AKSIS sekarang untuk mengelola kesiswaan dengan lebih efektif dan efisien
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-6 text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 rounded-xl">
                  Masuk ke Sistem
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">AKSIS</p>
              <p className="text-xs text-slate-500">SMAN 1 BANTARUJEG</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} AKSIS - Aplikasi Kesiswaan dan Sistem Informasi Sekolah. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
