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
 */
export function TransactionPagination({ total, totalPages, currentPage, pageSize }: PaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    if (totalPages <= 1) return null

    // Hitung rentang data yang sedang ditampilkan (misal: 1-10)
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, total)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-8 bg-gray-50/50 border-t border-gray-100">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Showing <span className="text-emerald-600">{startItem}-{endItem}</span> of <span className="text-emerald-950">{total}</span> transactions
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="size-10 rounded-xl hover:bg-white hover:shadow-md transition-all disabled:opacity-30"
                >
                    <ChevronLeft className="size-5" />
                </Button>

                <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1
                        const isCurrent = pageNum === currentPage

                        // Show first, last, and pages around current
                        if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                            return (
                                <Button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`size-10 rounded-xl font-bold text-xs transition-all shadow-sm ${isCurrent
                                        ? "bg-emerald-600 text-white shadow-emerald-500/20"
                                        : "bg-white text-emerald-950 hover:bg-emerald-50 shadow-gray-200/50"
                                        }`}
                                >
                                    {pageNum}
                                </Button>
                            )
                        } else if (
                            (pageNum === currentPage - 2 && pageNum > 1) ||
                            (pageNum === currentPage + 2 && pageNum < totalPages)
                        ) {
                            return <span key={pageNum} className="px-1 text-gray-300">...</span>
                        }
                        return null
                    })}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="size-10 rounded-xl hover:bg-white hover:shadow-md transition-all disabled:opacity-30"
                >
                    <ChevronRight className="size-5" />
                </Button>
            </div>
        </div>
    )
}
