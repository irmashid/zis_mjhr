import { getActivityLogs } from "@/lib/actions/activity"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import AktivitasTable from "@/components/activity/AktivitasTable"
import { History } from "lucide-react"
import { DashboardDateFilter } from "@/components/dashboard/DashboardDateFilter"

export const dynamic = "force-dynamic"

export default async function AktivitasPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    const searchParams = await props.searchParams
    const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
    const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined

    const { logs, total, totalPages } = await getActivityLogs(1, 5, startDate, endDate)

    const handlePageChange = async (page: number, start?: string, end?: string) => {
        "use server"
        const result = await getActivityLogs(page, 5, start, end)
        return {
            logs: result.logs as any,
            totalPages: result.totalPages
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-emerald-950 tracking-tight flex items-center gap-4">
                        <div className="size-12 rounded-3xl bg-emerald-100 flex items-center justify-center">
                            <History className="size-7 text-emerald-600" />
                        </div>
                        Riwayat Aktivitas
                    </h1>
                    <p className="text-emerald-900/40 font-bold uppercase tracking-[0.3em] text-[10px] ml-16">
                        Log Kegiatan & Audit Sistem
                    </p>
                </div>
                <DashboardDateFilter />
            </div>

            <AktivitasTable
                initialLogs={logs as any}
                totalLogs={total}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                startDate={startDate}
                endDate={endDate}
            />

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-emerald-900/40 font-medium">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Data riwayat aktivitas akan otomatis terhapus jika sudah lebih dari 90 hari</span>
            </div>
        </div>
    )
}
