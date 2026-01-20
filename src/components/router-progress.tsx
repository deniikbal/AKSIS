import { useRouterState } from '@tanstack/react-router'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'

export function RouterProgress() {
    const status = useRouterState({ select: (s) => s.status })
    const isPending = status === 'pending'
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isPending) {
            setProgress(0)
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev
                    return prev + Math.random() * 10
                })
            }, 200)
        } else {
            setProgress(100)
            const timeout = setTimeout(() => {
                setProgress(0)
            }, 300)
            return () => clearTimeout(timeout)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isPending])

    if (!isPending && progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
            <Progress
                value={progress}
                className="h-full rounded-none bg-transparent"
                style={{
                    transition: progress === 0 ? 'none' : 'all 0.4s ease'
                }}
            />
        </div>
    )
}
