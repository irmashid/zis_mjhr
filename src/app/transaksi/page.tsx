import { getTransactions } from "@/lib/actions/transaction"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Link from "next/link"
import { CreditCard, Plus } from "lucide-react"
import TransactionRowActions from "@/components/transaction/TransactionRowActions"
import SuccessModal from "@/components/transaction/SuccessModal"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

import { DashboardDateFilter } from "@/components/dashboard/DashboardDateFilter"
import { TransactionSearch } from "@/components/transaction/TransactionSearch"
import { TransactionPagination } from "@/components/transaction/TransactionPagination"

/**
 * Halaman Riwayat Transaksi.
 * Menampilkan tabel transaksi dengan fitur filter, pencarian, dan pagination.
 */
export default async function TransactionPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Parsing parameter dari URL untuk filter data
    const searchParams = await props.searchParams
    const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
    const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined
    const query = typeof searchParams.query === 'string' ? searchParams.query : undefined
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1

    // Fetch data transaksi sesuai parameter yang aktif
    const { data: transactions, metadata } = await getTransactions(startDate, endDate, query, page)

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-emerald-950 tracking-tight">Riwayat Transaksi</h1>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Daftar rekaman zakat & infaq masuk</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 xl:ml-auto">
                    <DashboardDateFilter />
                    <Link href="/transaksi/new" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                            <Plus className="mr-2 size-6" /> Catat Transaksi
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-md">
                <TransactionSearch />
            </div>

            <Card className="overflow-hidden border-0 shadow-premium bg-white max-w-full">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
                <CardContent className="p-0 overflow-x-auto">
                    <div className="min-w-[800px] lg:min-w-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu Transaksi</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID / Kwitansi</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jenis Penerimaan</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Nominal</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Keterangan</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <CreditCard className="size-12" />
                                                <p className="font-bold">Belum ada data transaksi yang tercatat.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t: any) => (
                                        <tr key={t.receiptId || t.id} className="group hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-emerald-950">
                                                        {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                                                        {new Date(t.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl inline-block shadow-sm">
                                                    {t.receiptId ? t.receiptId.split('-')[0] : `TX-${t.id.toString().padStart(6, '0')}`}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "size-2 rounded-full animate-pulse",
                                                        t.type === 'MAL' ? 'bg-amber-500' : t.type === 'FITRAH_BERAS' ? 'bg-blue-500' : 'bg-emerald-500'
                                                    )} />
                                                    <span className="font-bold text-gray-700 capitalize">
                                                        {t.type === "MAL" ? "Zakat Maal" :
                                                            t.type === "FITRAH_UANG" ? "Zakat Fitrah (Uang)" :
                                                                t.type === "FITRAH_BERAS" ? "Zakat Fitrah (Beras)" :
                                                                    t.type.toLowerCase().replace("_", " ")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-emerald-950 text-base">
                                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(t.totalAmount)}
                                                    </span>
                                                    {t.totalRice > 0 && (
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                            + {t.totalRice} Liter Beras
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-medium text-gray-400 line-clamp-1 max-w-[200px]" title={t.description}>
                                                    {t.description || "-"}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex items-center justify-center transition-all">
                                                    <TransactionRowActions transaction={t} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <TransactionPagination {...metadata} />
            </Card>

            <Suspense>
                <SuccessModal />
            </Suspense>
        </div>
    )
}
