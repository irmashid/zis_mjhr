"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Printer, Loader2, Save, History as HistoryIcon } from "lucide-react"
import { getTransactionsByReceiptId } from "@/lib/actions/transaction"
import ReceiptModal, { ReceiptData } from "./ReceiptModal"
import { AlertDialog } from "@/components/ui/AlertDialog"
import { Portal } from "@/components/ui/Portal"

export default function SuccessModal() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isSuccess = searchParams.get("success") === "updated"
    const receiptId = searchParams.get("receiptId")

    const [isOpen, setIsOpen] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

    // Generic Alert Config
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        variant: "default" as "default" | "destructive" | "warning"
    })

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }))

    useEffect(() => {
        if (isSuccess && receiptId) {
            setIsOpen(true)
        }
    }, [isSuccess, receiptId])

    const handleClose = () => {
        setIsOpen(false)
        // Bersihkan parameter URL
        const params = new URLSearchParams(searchParams.toString())
        params.delete("success")
        params.delete("receiptId")
        router.push(`/transaksi?${params.toString()}`, { scroll: false })
    }

    const handlePrint = async () => {
        if (!receiptId) return
        setIsPrinting(true)

        const transactions = await getTransactionsByReceiptId(receiptId)

        if (transactions.length === 0) {
            setAlertConfig({
                isOpen: true,
                title: "Data Tidak Ditemukan",
                description: "Gagal memuat data transaksi untuk dicetak. Silahkan coba lagi.",
                variant: "destructive"
            })
            setIsPrinting(false)
            return
        }

        // Agregasi data untuk struk
        const first = transactions[0]
        const names = transactions.filter((t: any) => t.type !== "INFAQ").map((t: any) => t.muzakkiName).filter(Boolean)
        const totalZakatUang = transactions.filter((t: any) => t.type !== "FITRAH_BERAS" && t.type !== "INFAQ").reduce((acc: number, curr: any) => acc + curr.amount, 0)
        const totalZakatBeras = transactions.filter((t: any) => t.type === "FITRAH_BERAS").reduce((acc: number, curr: any) => acc + (curr.amount_rice || 0), 0)
        const infaqAmount = transactions.filter((t: any) => t.type === "INFAQ").reduce((acc: number, curr: any) => acc + curr.amount, 0)
        const totalBayar = totalZakatUang + infaqAmount

        setReceiptData({
            id: receiptId,
            date: new Date(first.createdAt).toLocaleString("id-ID"),
            names,
            type: first.type,
            totalZakatUang,
            totalZakatBeras,
            infaqAmount,
            totalBayar,
            paymentAmount: first.paymentAmount || totalBayar,
            kembalian: first.kembalian || 0,
            officerName: (first as any).createdBy?.nama_lengkap
        })

        setIsReceiptModalOpen(true)
        setIsPrinting(false)
    }

    if (!isOpen) return null

    return (
        <Portal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={handleClose} />

                <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                    <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
                        <CardContent className="p-10 text-center space-y-6">
                            <div className="mx-auto size-20 bg-blue-50 rounded-full flex items-center justify-center">
                                <Save className="size-10 text-blue-600" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Perubahan disimpan</h2>
                                <p className="text-slate-500 font-medium">Data transaksi telah berhasil diperbarui di sistem.</p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <Button
                                    onClick={handlePrint}
                                    disabled={isPrinting}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {isPrinting ? <Loader2 className="size-5 animate-spin" /> : <Printer className="size-5" />}
                                    Cetak Ulang Transaksi
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={handleClose}
                                    className="w-full h-12 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <HistoryIcon className="size-4" />
                                    Kembali ke Riwayat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                data={receiptData}
            />

            <AlertDialog
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                onConfirm={closeAlert}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                confirmText="Mengerti"
                cancelText="Tutup"
            />
        </Portal>
    )
}
