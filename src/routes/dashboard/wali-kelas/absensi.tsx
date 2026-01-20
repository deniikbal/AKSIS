import { createFileRoute, Link } from '@tanstack/react-router';
import { getWaliKelasData } from '@/lib/server/kelas';
import { getSession } from '@/lib/session';
import { saveSingleAttendance, getClassAttendance } from '@/lib/server/attendance';
import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ClipboardCheck,
  Calendar,
  ChevronLeft,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alfa' | null;

interface StudentAttendance {
  status: AttendanceStatus;
  keterangan: string;
}

export const Route = createFileRoute('/dashboard/wali-kelas/absensi')({
  loader: async () => {
    const session = await getSession();
    if (!session?.user?.id) return { classData: null, userRole: null };

    const classData = await getWaliKelasData({ data: session.user.id });
    return { classData, userRole: (session.user as any).role };
  },
  component: AbsensiPage,
})

function AbsensiPage() {
  const { classData } = Route.useLoaderData();
  const [searchValue, setSearchValue] = useState('');
  const [attendanceState, setAttendanceState] = useState<Record<string, StudentAttendance>>({});
  const [savingStudents, setSavingStudents] = useState<Record<string, AttendanceStatus>>({});
  const [currentTime, setCurrentTime] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [selectedDate, setSelectedDate] = useState(() => {
    // Get current date in Jakarta timezone (UTC+7)
    const jakartaDate = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).split(' ')[0];
    return jakartaDate;
  });

  const students = useMemo(() => {
    if (!classData?.anggota) return [];
    return classData.anggota
      .map((a: any) => {
        const student = a.siswa;
        const memberships = student?.anggotaKelas || [];
        // Find the regular class (jenisRombel 1 or 9)
        const regularClass = memberships.find((m: any) =>
          m.kelas?.jenisRombel === '1' || m.kelas?.jenisRombel === '9'
        )?.kelas?.nama || '-';

        return {
          ...student,
          regularClass,
          anggotaKelas: memberships
        };
      })
      .filter((s: any) => s.id)
      .sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || ''));
  }, [classData]);

  // Update Jakarta time every second
  useEffect(() => {
    const updateTime = () => {
      const jakartaTime = new Date().toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(jakartaTime + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch attendance data when date or class changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!classData?.id || !students.length) return;

      setIsLoadingData(true);

      // Initialize all students with null status
      const initialState: Record<string, StudentAttendance> = {};
      students.forEach((s: any) => {
        initialState[s.id] = { status: null, keterangan: '' };
      });

      try {
        const existingAttendance = await getClassAttendance({
          data: { kelasId: classData.id, tanggal: selectedDate }
        });

        // Update state with existing attendance data
        existingAttendance.forEach((record: any) => {
          if (record.siswaId && initialState[record.siswaId]) {
            initialState[record.siswaId] = {
              status: record.status as AttendanceStatus,
              keterangan: record.keterangan || ''
            };
          }
        });
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setAttendanceState(initialState);
        setIsLoadingData(false);
      }
    };

    fetchAttendance();
  }, [classData?.id, selectedDate, students]);

  const filteredStudents = useMemo(() => {
    if (!searchValue) return students;
    const search = searchValue.toLowerCase();
    return students.filter((s: any) =>
      s.nama?.toLowerCase().includes(search) ||
      s.nis?.includes(search)
    );
  }, [students, searchValue]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    if (!classData?.id || !status) return;

    // Set loading state for this specific status
    setSavingStudents(prev => ({ ...prev, [studentId]: status }));

    try {
      const result = await saveSingleAttendance({
        data: {
          siswaId: studentId,
          kelasId: classData.id,
          tanggal: selectedDate,
          status: status as 'hadir' | 'izin' | 'sakit' | 'alfa',
          keterangan: attendanceState[studentId]?.keterangan || ''
        }
      });

      if (result.success) {
        // Update local state
        setAttendanceState(prev => ({
          ...prev,
          [studentId]: { ...prev[studentId], status }
        }));

        const statusLabel = status === 'hadir' ? 'Hadir' : status === 'izin' ? 'Izin' : status === 'sakit' ? 'Sakit' : 'Alfa';
        toast.success(`Tersimpan: ${statusLabel}`, {
          description: `Status absensi berhasil diperbarui.`,
          duration: 1500
        });
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Gagal menyimpan absensi");
    } finally {
      setSavingStudents(prev => ({ ...prev, [studentId]: null }));
    }
  };

  const handleNoteChange = (studentId: string, keterangan: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], keterangan }
    }));
  };

  const stats = useMemo(() => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
    Object.values(attendanceState).forEach(v => {
      if (v.status && v.status in counts) {
        counts[v.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [attendanceState]);

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <ClipboardCheck className="h-16 w-16 text-muted-foreground/30" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Data Kelas Tidak Ditemukan</h2>
          <p className="text-muted-foreground">Anda belum terdaftar sebagai Pembina ekstrakurikuler.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 bg-gradient-to-b from-slate-50/50 to-white min-h-screen">
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
              <Link to="/dashboard/wali-kelas">Kelas Saya</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Absensi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 md:w-7 md:h-7 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">Absensi {classData.nama}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                TA {classData.tahunAjaran}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium whitespace-nowrap">
                🕐 {currentTime}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full md:w-auto">
          <Link to="/dashboard/wali-kelas">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-l-4 border-l-emerald-500 overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold text-emerald-600 leading-tight">{stats.hadir}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hadir</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold text-blue-600 leading-tight">{stats.izin}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Izin</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold text-amber-600 leading-tight">{stats.sakit}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sakit</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 overflow-hidden">
          <CardContent className="p-3 md:p-4">
            <div className="text-xl md:text-2xl font-bold text-red-600 leading-tight">{stats.alfa}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Alfa</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl">Pencatatan Kehadiran</CardTitle>
              <CardDescription className="text-xs md:text-sm">{filteredStudents.length} siswa terdaftar</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-40 h-9 text-sm"
                />
                {isLoadingData && (
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa..."
                  className="pl-9 w-full sm:w-56 h-9 text-sm"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile View (Cards) */}
          <div className="block md:hidden divide-y">
            {paginatedStudents.map((siswa, idx) => {
              const initials = siswa.nama?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
              const attendance = attendanceState[siswa.id] || { status: null, keterangan: '' };
              const rowNumber = (page - 1) * pageSize + idx + 1;

              return (
                <div key={siswa.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">#{rowNumber}</span>
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm leading-tight text-foreground">{siswa.nama}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground font-mono">{siswa.nis || '-'}</span>
                          <span className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-500 rounded font-medium">{siswa.regularClass}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'hadir', label: 'Hadir', short: 'H', bg: '#10b981', border: '#6ee7b7' },
                        { id: 'izin', label: 'Izin', short: 'I', bg: '#3b82f6', border: '#93c5fd' },
                        { id: 'sakit', label: 'Sakit', short: 'S', bg: '#f59e0b', border: '#fcd34d' },
                        { id: 'alfa', label: 'Alfa', short: 'A', bg: '#ef4444', border: '#fca5a5' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          disabled={!!savingStudents[siswa.id]}
                          onClick={() => handleStatusChange(siswa.id, opt.id as AttendanceStatus)}
                          className="flex flex-col items-center justify-center py-1 rounded-lg border-2 transition-all relative overflow-hidden"
                          style={{
                            backgroundColor: attendance.status === opt.id ? opt.bg : 'white',
                            color: attendance.status === opt.id ? 'white' : opt.bg,
                            borderColor: attendance.status === opt.id ? opt.bg : opt.border,
                            boxShadow: attendance.status === opt.id ? `0 4px 10px ${opt.bg}40` : 'none',
                            opacity: attendance.status && attendance.status !== opt.id ? 0.5 : 1
                          }}
                        >
                          {savingStudents[siswa.id] === opt.id ? (
                            <div className="flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                                style={{ borderColor: attendance.status === opt.id ? 'white' : opt.bg, borderTopColor: 'transparent' }}
                              />
                            </div>
                          ) : (
                            <>
                              <span className="text-[10px] font-bold">{opt.short}</span>
                              <span className="text-[7px] uppercase tracking-tighter opacity-80">{opt.label}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Input
                        className="h-9 text-xs pr-8 bg-slate-50 border-none italic"
                        placeholder="Tambah catatan..."
                        value={attendance.keterangan}
                        onChange={(e) => handleNoteChange(siswa.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-12 pl-6 py-3 text-xs uppercase tracking-wider font-semibold">No</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-semibold">Siswa</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-semibold">Kelas Reguler</TableHead>
                  <TableHead className="text-center py-3 text-xs uppercase tracking-wider font-semibold">Status Kehadiran</TableHead>
                  <TableHead className="pr-6 py-3 text-xs uppercase tracking-wider font-semibold">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((siswa: any, idx: number) => {
                  const initials = siswa.nama?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                  const attendance = attendanceState[siswa.id] || { status: null, keterangan: '' };
                  const rowNumber = (page - 1) * pageSize + idx + 1;

                  return (
                    <TableRow key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 py-2 text-muted-foreground text-sm font-mono">{rowNumber}</TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm leading-tight text-foreground">{siswa.nama}</div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{siswa.nis || '-'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium bg-slate-50/50">
                          {siswa.regularClass}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {[
                            { id: 'hadir', label: 'H', bg: '#10b981', border: '#6ee7b7' },
                            { id: 'izin', label: 'I', bg: '#3b82f6', border: '#93c5fd' },
                            { id: 'sakit', label: 'S', bg: '#f59e0b', border: '#fcd34d' },
                            { id: 'alfa', label: 'A', bg: '#ef4444', border: '#fca5a5' }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              disabled={!!savingStudents[siswa.id]}
                              onClick={() => handleStatusChange(siswa.id, opt.id as AttendanceStatus)}
                              className="w-9 h-9 rounded-lg border-2 text-xs font-bold transition-all hover:scale-105 shadow-sm flex items-center justify-center"
                              style={{
                                backgroundColor: attendance.status === opt.id ? opt.bg : 'white',
                                color: attendance.status === opt.id ? 'white' : opt.bg,
                                borderColor: attendance.status === opt.id ? opt.bg : opt.border,
                                boxShadow: attendance.status === opt.id ? `0 4px 12px ${opt.bg}40` : 'none',
                                transform: attendance.status === opt.id ? 'scale(1.1)' : 'scale(1)',
                                opacity: attendance.status && attendance.status !== opt.id ? 0.6 : 1
                              }}
                              title={opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}
                            >
                              {savingStudents[siswa.id] === opt.id ? (
                                <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                                  style={{ borderColor: attendance.status === opt.id ? 'white' : opt.bg, borderTopColor: 'transparent' }}
                                />
                              ) : (
                                opt.label
                              )}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 py-2">
                        <Input
                          className="h-8 text-xs bg-slate-50/50 focus:bg-white transition-colors"
                          placeholder="Tambahkan catatan..."
                          value={attendance.keterangan}
                          onChange={(e) => handleNoteChange(siswa.id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="py-12 text-center text-muted-foreground bg-white">
              <ClipboardCheck className="h-12 w-12 mx-auto opacity-10 mb-2" />
              <p className="text-sm">Tidak ada siswa ditemukan.</p>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-slate-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground font-medium">
                {filteredStudents.length} siswa • Halaman {page} dari {totalPages || 1}
              </p>
              <span className="hidden sm:inline text-slate-300">|</span>
              <p className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-save Active
              </p>
            </div>

            <Pagination className="mx-0 w-auto order-1 sm:order-2">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={`h-9 px-3 text-xs ${page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer bg-white border shadow-sm hover:bg-slate-50"}`}
                  />
                </PaginationItem>
                <PaginationItem className="hidden sm:block">
                  <div className="px-4 py-2 text-xs font-bold bg-white border rounded-md shadow-sm min-w-[3rem] text-center">
                    {page} / {totalPages || 1}
                  </div>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={`h-9 px-3 text-xs ${page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer bg-white border shadow-sm hover:bg-slate-50"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Card>
    </div>
  );
}
