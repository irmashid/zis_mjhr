"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, History, User, Info, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface Activity {
    id: number
    action: string
    details: string
    createdAt: Date
    user: {
        nama_lengkap: string
        role: string
    }
}

interface AktivitasTableProps {
    initialLogs: Activity[]
    totalLogs: number
    totalPages: number
    onPageChange: (page: number, startDate?: string, endDate?: string) => Promise<{ logs: Activity[], totalPages: number }>
    startDate?: string
    endDate?: string
}

export default function AktivitasTable({ initialLogs, totalLogs, totalPages: initialTotalPages, onPageChange, startDate, endDate }: AktivitasTableProps) {
    const [logs, setLogs] = useState(initialLogs)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [isLoading, setIsLoading] = useState(false)

    // Reset page and logs when filters change
    useEffect(() => {
        setCurrentPage(1)
        setLogs(initialLogs)
        setTotalPages(initialTotalPages)
    }, [startDate, endDate, initialLogs, initialTotalPages])

    const handlePageChange = async (page: number) => {
        if (page < 1 || page > totalPages || isLoading) return
        setIsLoading(true)
        setCurrentPage(page)
        const result = await onPageChange(page, startDate, endDate)
        setLogs(result.logs)
        setTotalPages(result.totalPages)
        setIsLoading(false)
    }

    return (
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-emerald-900/5">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-emerald-50/50 border-b border-emerald-100/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">User</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Aktivitas</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50/50">
                            {logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-emerald-50/30 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                                                <User className="size-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-950 leading-tight">{log.user.nama_lengkap}</p>
                                                <p className="text-[10px] font-medium text-emerald-600/60 uppercase tracking-widest mt-0.5">
                                                    {log.user.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                                <Info className="size-3.5" />
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                                {log.details}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                                            <Clock className="size-3.5" />
                                            <div className="text-xs font-mono font-medium">
                                                <p>{new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] opacity-70">{new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-200">
                                                <History className="size-8" />
                                            </div>
                                            <p className="text-sm font-bold text-emerald-900/40 uppercase tracking-widest">Belum ada aktivitas tercatat</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Updated Pagination UI - Matching "Slide" style */}
                <div className="px-8 py-6 bg-emerald-50/30 border-t border-emerald-100/50 flex items-center justify-end gap-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-900/60 uppercase tracking-widest">
                        <span>Halaman</span>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-emerald-100">
                            <span className="text-emerald-600">{currentPage}</span>
                            <span className="opacity-40">/</span>
                            <span>{totalPages}</span>
                        </div>
                        <span className="ml-1">dari {totalLogs} data</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="size-10 rounded-xl bg-white border border-emerald-100 shadow-sm text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="size-10 rounded-xl bg-white border border-emerald-100 shadow-sm text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight className="size-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
