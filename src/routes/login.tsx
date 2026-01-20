import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'
import { LogIn, User, Lock, Loader2, School, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error: authError } = await (authClient.signIn as any).username({
                username: identifier,
                password
            })

            if (authError) {
                setError(authError.message || 'Login gagal. Silakan cek kembali username dan password Anda.')
            } else {
                navigate({ to: '/dashboard' })
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem. Silakan coba lagi nanti.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background gradient blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md p-4 z-10">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                    <CardHeader className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                <School className="text-primary-foreground w-10 h-10" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">AKSIS</CardTitle>
                            <CardDescription className="mt-2 text-xs">
                                Aplikasi Kesiswaan dan Sistem Informasi Sekolah
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        id="username"
                                        type="text"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="pl-10"
                                        placeholder="Masukkan username Anda"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Masuk ke Dashboard
                                        <LogIn className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center border-t pt-6">
                        <p className="text-muted-foreground text-xs">
                            &copy; {new Date().getFullYear()} SMAN 1 BANTARUJEG. All rights reserved.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
