"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Printer, X } from "lucide-react"
import { Portal } from "@/components/ui/Portal"

export type ReceiptData = {
    id: string
    date: string
    names: string[]
    type: string
    totalZakatUang: number
    totalZakatBeras: number
    infaqAmount: number
    totalBayar: number
    paymentAmount: number
    kembalian: number
    officerName?: string
}

interface ReceiptModalProps {
    isOpen: boolean
    onClose: () => void
    data: ReceiptData | null
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
    if (!isOpen || !data) return null

    const handlePrint = () => {
        window.print()
    }

    return (
        <Portal>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans receipt-modal-overlay">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 print:hidden"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300 print:max-h-none print:w-full print:max-w-none print:static print:animate-none">
                    <div className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 print:shadow-none print:rounded-none">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10 print:hidden">
                            <h2 className="font-bold text-slate-800 tracking-tight">Struk Transaksi</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="size-5" />
                            </Button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50 print:p-0 print:overflow-visible print:bg-white">
                            {/* Printable Area */}
                            <Card className="print-section border-0 shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/60 print:ring-0 print:shadow-none print:rounded-none">
                                <CardContent className="p-8 pb-16 space-y-6 font-mono text-sm text-slate-600 print:p-4 print:pb-24">
                                    <div className="text-center border-b-2 border-slate-900 pb-6 mb-2 print:pb-4">
                                        <h3 className="font-black text-xl text-emerald-600 tracking-tighter">Panitia ZIS</h3>
                                        <p className="font-bold text-slate-800">Masjid Jami' Hidayaturrahmah</p>
                                        <p>Jl. Bhakti ABRI No. 1 RT.001/RW.04</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{data.date}</p>
                                        <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mt-2 print:border print:border-emerald-200">
                                            ID: {data.id?.split('-')[0]}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-slate-400">Tipe:</span>
                                            <span className="font-bold text-slate-800 text-right uppercase">
                                                {data.type === "MAL" ? "Zakat Maal" :
                                                    data.type === "FITRAH_UANG" ? "Zakat Fitrah (Uang)" :
                                                        data.type === "FITRAH_BERAS" ? "Zakat Fitrah (Beras)" :
                                                            data.type.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900">
                                            <span className="text-slate-400">Muzakki:</span>
                                            <span className="font-bold text-slate-800">{(data.names as string[]).length} Jiwa</span>
                                        </div>
                                        <ul className="pl-4 space-y-1">
                                            {(data.names as string[]).map((n: string, i: number) => (
                                                <li key={i} className="text-xs list-disc marker:text-emerald-400">
                                                    {n}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="border-t-2 border-dashed border-slate-900 my-4 pt-4 space-y-2">
                                        {data.totalZakatBeras > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Zakat Beras</span>
                                                <span className="font-bold text-slate-800">{data.totalZakatBeras} Liter</span>
                                            </div>
                                        )}
                                        {data.totalZakatUang > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">{data.type === "MAL" ? "Zakat Maal" : "Zakat Fitrah (Uang)"}</span>
                                                <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat("id-ID").format(data.totalZakatUang)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Infaq/Sedekah</span>
                                            <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat("id-ID").format(data.infaqAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                                            <span className="font-bold text-slate-800">Total</span>
                                            <span className="font-black text-lg text-emerald-600">
                                                Rp {new Intl.NumberFormat("id-ID").format(data.totalBayar)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 pt-2 bg-slate-50/50 p-4 rounded-xl print:bg-transparent print:border print:border-slate-100">
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>Uang Diterima</span>
                                            <span className="font-bold text-slate-600">
                                                Rp {new Intl.NumberFormat("id-ID").format(data.paymentAmount || data.totalBayar)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">Kembali</span>
                                            <span className="font-black text-slate-800">
                                                Rp {new Intl.NumberFormat("id-ID").format(data.kembalian || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Section: Side-by-Side */}
                                    <div className="pt-6 grid grid-cols-2 gap-4 items-start border-t-2 border-slate-900">
                                        <div className="text-left space-y-1">
                                            <p className="text-[10px] font-bold text-slate-800">Terima kasih atas Zakat/Infaq Anda.</p>
                                            <p className="text-[10px] text-slate-400 italic">Semoga berkah dan diterima Allah SWT.</p>
                                        </div>

                                        <div className="flex flex-col items-end print:pr-4">
                                            <div className="w-40 text-center space-y-10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Petugas ZIS</p>
                                                    <div className="h-0.5 w-full bg-slate-900 opacity-20" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-800 underline uppercase decoration-slate-900 decoration-2 underline-offset-4">
                                                        {data.officerName || "...................."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 flex gap-4 print:hidden bg-white">
                            <Button
                                onClick={handlePrint}
                                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                            >
                                <Printer className="mr-2 size-4" /> Cetak Struk
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="flex-1 h-12 border border-slate-100 hover:bg-slate-50 text-slate-500 font-bold rounded-2xl"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    /* Hide everything in the body */
                    body * {
                        visibility: hidden !important;
                    }
                    /* Show the portal overlay and the print section specifically */
                    .receipt-modal-overlay,
                    .receipt-modal-overlay *,
                    .print-section,
                    .print-section * {
                        visibility: visible !important;
                    }
                    /* Force display block/flex for elements inside print section */
                    .print-section {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .print-section .flex { display: flex !important; }
                    .print-section .grid { display: grid !important; }
                    .print-section .inline-block { display: inline-block !important; }
                    
                    /* Hide non-printable modal parts */
                    .print-hidden, .print\:hidden {
                        display: none !important;
                        visibility: hidden !important;
                    }
                }
            `}</style>
            </div>
        </Portal>
    )
}
