"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { useDebounce } from "use-debounce"

/**
 * Komponen pencarian transaksi secara real-time.
 * Menggunakan debounce agar tidak memberatkan server saat user mengetik.
 */
export function TransactionSearch() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [text, setText] = useState(searchParams.get("query") || "")
    // Debounce: Tunggu 500ms setelah user berhenti mengetik sebelum memproses pencarian
    const [query] = useDebounce(text, 500)

    useEffect(() => {
        const currentQuery = searchParams.get("query") || ""
        if (query === currentQuery) return

        const params = new URLSearchParams(searchParams.toString())
        if (query) {
            params.set("query", query)
        } else {
            params.delete("query")
        }
        router.push(`${pathname}?${params.toString()}`)
    }, [query, pathname, router, searchParams])

    return (
        <div className="relative group w-full">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 transition-colors group-hover:text-emerald-500">
                <Search className="size-5" />
            </div>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cari ID Kwitansi atau Nama Pembayar..."
                className="w-full h-14 pl-14 pr-12 rounded-2xl bg-white shadow-lg border border-gray-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold text-emerald-950 placeholder:text-gray-300 placeholder:font-bold"
            />
            {text && (
                <button
                    onClick={() => setText("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    )
}
