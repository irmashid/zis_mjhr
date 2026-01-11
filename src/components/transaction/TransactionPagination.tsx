"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface PaginationProps {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
}

/**
 * Komponen navigasi halaman (pagination).
 * Sinkron dengan URL query parameter 'page'.
 * Menampilkan gaya "Slide" di pojok kanan bawah.
 */
export function TransactionPagination({ total, totalPages, currentPage, pageSize }: PaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", newPage.toString())
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    if (total === 0) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 py-4 px-8 bg-gray-50/30 border-t border-gray-100/50">
            <div className="flex items-center gap-4">
                <div className="text-[11px] font-black text-emerald-950 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                    <span className="text-emerald-600">{currentPage}</span>
                    <span className="mx-1 text-gray-300">/</span>
                    <span className="text-emerald-600">{totalPages || 1}</span>
                    <span className="ml-2 text-gray-400 font-bold lowercase tracking-normal">dari {total} data</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="size-8 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-20"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="size-8 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-20"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
