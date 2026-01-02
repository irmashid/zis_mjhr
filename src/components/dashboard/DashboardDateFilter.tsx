"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Calendar, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/Button"

/**
 * Komponen Filter Tanggal pada Dashboard.
 * Memungkinkan user memfilter statistik berdasarkan rentang waktu tertentu.
 */
export function DashboardDateFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State lokal untuk menyimpan input tanggal sebelum di-apply
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")

    const handleFilter = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (startDate) params.set("startDate", startDate)
        else params.delete("startDate")

        if (endDate) params.set("endDate", endDate)
        else params.delete("endDate")

        router.push(`${pathname}?${params.toString()}`)
    }

    const handleReset = () => {
        setStartDate("")
        setEndDate("")
        const params = new URLSearchParams(searchParams.toString())
        params.delete("startDate")
        params.delete("endDate")
        router.push(`${pathname}?${params.toString()}`)
    }

    const hasFilters = searchParams.get("startDate") || searchParams.get("endDate")

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-2xl bg-white/50 backdrop-blur-md shadow-sm border border-emerald-900/5 max-w-fit xl:ml-auto">
            <div className="flex items-center gap-3 px-2">
                <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Calendar className="size-4" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-emerald-500/20 text-[11px] font-bold text-emerald-950 transition-all outline-none"
                        />
                    </div>
                    <span className="text-[10px] font-black text-gray-300">/</span>
                    <div className="relative">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-emerald-500/20 text-[11px] font-bold text-emerald-950 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                <Button
                    onClick={handleFilter}
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                >
                    <Filter className="size-3.5" />
                    Filter
                </Button>
                {hasFilters && (
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="h-9 px-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
