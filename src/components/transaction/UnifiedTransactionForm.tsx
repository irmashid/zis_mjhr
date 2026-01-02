"use client"

import { useState, useEffect } from "react"
import { createBulkTransaction, updateBulkTransaction } from "@/lib/actions/bulk_transaction"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent } from "@/components/ui/Card"
import { TransactionType } from "@prisma/client"
import { Printer, Save, Plus, Trash2, Calculator, Loader2, ArrowLeft, History as HistoryIcon, Coins, Wheat, Wallet, UserCheck, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface UnifiedTransactionFormProps {
    initialData?: {
        receiptId?: string
        type: TransactionType
        muzakkiCount: number
        names: string[]
        amountPerPerson: number
        amountRicePerPerson: number
        infaqAmount: number
        paymentAmount?: number
    }
    originalId?: number // Added for single transaction edit fallback
}

/**
 * Komponen formulir utama untuk mencatat transaksi Zakat & Infaq.
 * Mendukung pencatatan batch (grup) dan satu-persatu.
 */
export default function UnifiedTransactionForm({ initialData, originalId }: UnifiedTransactionFormProps) {
    const router = useRouter()
    const [step, setStep] = useState<"INPUT" | "SUCCESS">("INPUT")
    const [isUpdate, setIsUpdate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [receiptData, setReceiptData] = useState<any>(null)

    // State formulir: Mengatur input dari user
    const [type, setType] = useState<TransactionType>(initialData?.type || "FITRAH_UANG")
    const [muzakkiCount, setMuzakkiCount] = useState(initialData?.muzakkiCount || 1)
    const [names, setNames] = useState<string[]>(initialData?.names || [""])
    const [amountPerPerson, setAmountPerPerson] = useState(initialData?.amountPerPerson ?? 45000)
    const [amountRicePerPerson, setAmountRicePerPerson] = useState(initialData?.amountRicePerPerson ?? 3.5)
    const [infaqAmount, setInfaqAmount] = useState(initialData?.infaqAmount || 0)
    const [paymentAmount, setPaymentAmount] = useState(initialData?.paymentAmount || 0)

    // Kalkulasi otomatis berdasarkan input user
    const totalZakatUang = type === "FITRAH_UANG" || type === "MAL" ? amountPerPerson * (type === "MAL" ? 1 : muzakkiCount) : 0
    const totalZakatBeras = type === "FITRAH_BERAS" ? amountRicePerPerson * muzakkiCount : 0
    const totalBayar = totalZakatUang + infaqAmount
    const kembalian = paymentAmount - totalBayar

    // Handle Count Change
    useEffect(() => {
        const count = Math.max(1, muzakkiCount)
        setNames(prev => {
            const newNames = [...prev]
            if (count > prev.length) {
                // Add empty strings
                for (let i = prev.length; i < count; i++) newNames.push("")
            } else if (count < prev.length) {
                // Trim
                newNames.splice(count)
            }
            return newNames
        })
    }, [muzakkiCount])

    // Handle Type Change Defaults - Only run on manual type change, not initial load
    useEffect(() => {
        if (!initialData) {
            if (type === "FITRAH_UANG") setAmountPerPerson(45000)
            if (type === "FITRAH_BERAS") setAmountRicePerPerson(3.5)
            if (type === "MAL") {
                setMuzakkiCount(1) // Mal usually individual
                setAmountPerPerson(0)
            }
        }
    }, [type, initialData])

    // Helper for currency input
    const formatCurrency = (val: number) => val ? new Intl.NumberFormat("id-ID").format(val) : ""
    const parseCurrency = (val: string) => parseInt(val.replace(/\./g, "")) || 0

    /**
     * Menangani pengiriman data ke server.
     * Memisahkan logika antara transaksi baru dan pembaruan data (edit).
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Validate Names
        if (names.some(n => !n.trim())) {
            alert("Harap isi semua nama muzakki")
            setLoading(false)
            return
        }

        const data = {
            type,
            muzakkiNames: names,
            amountPerPerson: amountPerPerson,
            amountRicePerPerson: amountRicePerPerson,
            infaqAmount: infaqAmount,
            paymentAmount: paymentAmount,
            kembalian: kembalian,
            description: `Membayar zakat untuk ${muzakkiCount} orang`
        }

        if (initialData?.receiptId || originalId) {
            const res = await updateBulkTransaction(initialData?.receiptId, data, originalId)
            if (res.success) {
                // Redirect to handle success on a stable page (avoid 404 on current dynamic ID)
                router.push(`/transaksi?success=updated&receiptId=${res.receiptId}`)
            } else {
                alert("Gagal memperbarui transaksi")
                setLoading(false)
            }
        } else {
            const res = await createBulkTransaction(data)
            if (res.success) {
                setIsUpdate(false)
                setReceiptData({
                    id: res.receiptId,
                    date: new Date().toLocaleString("id-ID"),
                    names,
                    type,
                    totalZakatUang,
                    totalZakatBeras,
                    infaqAmount,
                    totalBayar,
                    paymentAmount,
                    kembalian
                })
                setStep("SUCCESS")
            } else {
                alert("Gagal menyimpan transaksi")
            }
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const resetForm = () => {
        setStep("INPUT")
        setNames([""])
        setMuzakkiCount(1)
        setInfaqAmount(0)
        setPaymentAmount(0)
        setReceiptData(null)
    }

    if (step === "SUCCESS") {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className={`p-6 rounded-3xl text-center shadow-lg border animate-in fade-in zoom-in duration-500 ${isUpdate ? 'bg-blue-50 border-blue-100 text-blue-900 shadow-blue-100' : 'bg-emerald-50 border-emerald-100 text-emerald-900 shadow-emerald-100'}`}>
                    <div className={`mx-auto size-16 rounded-full flex items-center justify-center mb-4 ${isUpdate ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {isUpdate ? <Save className="size-8" /> : <Plus className="size-8" />}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{isUpdate ? "Perubahan disimpan" : "Transaksi Berhasil!"}</h2>
                    <p className="opacity-70 font-medium">{isUpdate ? "Data transaksi telah diperbarui dan struk sudah siap dicetak ulang." : "Transaksi baru telah dicatat ke dalam sistem."}</p>
                </div>

                {/* Printable Area */}
                <Card className="print-section border-2 border-dashed border-gray-300">
                    <CardContent className="p-8 space-y-4 font-mono text-sm">
                        <div className="text-center border-b pb-4 mb-4">
                            <h3 className="font-bold text-lg">ZIS MJHR</h3>
                            <p>Masjid Jami' Hidayaturrahmah</p>
                            <p className="text-xs text-gray-500">{receiptData.date}</p>
                            <p className="text-xs text-gray-500">ID: {receiptData.id?.split('-')[0]}</p>
                        </div>

                        <div className="space-y-1">
                            <p><strong>Tipe:</strong> {
                                receiptData.type === "MAL" ? "Zakat Maal" :
                                    receiptData.type === "FITRAH_UANG" ? "Zakat Fitrah (Uang)" :
                                        receiptData.type === "FITRAH_BERAS" ? "Zakat Fitrah (Beras)" :
                                            receiptData.type.replace("_", " ")
                            }</p>
                            <div className="flex justify-between">
                                <span>Muzakki:</span>
                                <span>{Array.from(new Set(receiptData.names as string[])).length} Orang</span>
                            </div>
                            <ul className="pl-4 list-disc text-xs text-gray-600">
                                {Array.from(new Set(receiptData.names as string[])).map((n: string, i: number) => <li key={i}>{n}</li>)}
                            </ul>
                        </div>

                        <div className="border-t border-dashed my-4 pt-2 space-y-1">
                            {receiptData.totalZakatBeras > 0 && (
                                <div className="flex justify-between">
                                    <span>Zakat Beras</span>
                                    <span>{receiptData.totalZakatBeras} Liter</span>
                                </div>
                            )}
                            {receiptData.totalZakatUang > 0 && (
                                <div className="flex justify-between">
                                    <span>{receiptData.type === "MAL" ? "Zakat Maal" : "Zakat Fitrah (Uang)"}</span>
                                    <span>{new Intl.NumberFormat("id-ID").format(receiptData.totalZakatUang)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Infaq/Sedekah</span>
                                <span>{new Intl.NumberFormat("id-ID").format(receiptData.infaqAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                                <span>Total Pembayaran</span>
                                <span>{new Intl.NumberFormat("id-ID").format(receiptData.totalBayar)}</span>
                            </div>
                        </div>

                        <div className="space-y-1 pt-2">
                            <div className="flex justify-between">
                                <span>Bayar</span>
                                <span>{new Intl.NumberFormat("id-ID").format(receiptData.paymentAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Kembali</span>
                                <span>{new Intl.NumberFormat("id-ID").format(receiptData.kembalian)}</span>
                            </div>
                        </div>

                        <div className="text-center pt-8 text-xs text-gray-400">
                            <p>Terima kasih atas Zakat/Infaq Anda.</p>
                            <p>Semoga berkah dan diterima Allah SWT.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                    <Button
                        onClick={() => router.push("/transaksi")}
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl border-gray-200 hover:bg-gray-50 font-bold"
                    >
                        <HistoryIcon className="mr-2 size-4" /> Kembali ke Riwayat
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className={`flex-1 h-12 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all ${isUpdate ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                    >
                        <Printer className="mr-2 size-4" /> {isUpdate ? "Cetak Ulang Transaksi" : "Cetak Struk"}
                    </Button>
                    {!isUpdate && (
                        <Button
                            onClick={resetForm}
                            className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                        >
                            <Plus className="mr-2 size-4" /> Transaksi Baru
                        </Button>
                    )}
                </div>

                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-section, .print-section * { visibility: visible; }
                        .print-section { position: absolute; left: 0; top: 0; width: 100%; border: none; }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 px-1 sm:px-0">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                {/* Step 1: Jenis Zakat */}
                <Card className="overflow-hidden border-0 shadow-premium bg-white group hover:shadow-2xl transition-all duration-500">
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
                    <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="size-10 sm:size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                                <Plus className="size-5 sm:size-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight truncate">Kategori Zakat</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">Pilih jenis penerimaan hari ini</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {[
                                { id: "FITRAH_UANG", label: "Fitrah Uang", icon: Coins, color: "emerald" },
                                { id: "FITRAH_BERAS", label: "Fitrah Beras", icon: Wheat, color: "blue" },
                                { id: "MAL", label: "Zakat Mal", icon: Wallet, color: "amber" }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setType(t.id as any)}
                                    className={cn(
                                        "flex sm:flex-col items-center sm:justify-center p-4 sm:p-6 rounded-3xl border-2 transition-all duration-300 gap-4 sm:gap-3 group/btn",
                                        type === t.id
                                            ? `bg-${t.color}-50 border-${t.color}-500 text-${t.color}-700 shadow-lg shadow-${t.color}-500/10`
                                            : "bg-white border-gray-50 text-gray-400 hover:border-emerald-200 hover:bg-emerald-50/10"
                                    )}
                                >
                                    <t.icon className={cn("size-6 sm:size-8 transition-transform duration-500 group-hover/btn:scale-110 shrink-0", type === t.id ? `text-${t.color}-500` : "text-gray-300")} />
                                    <span className="text-xs font-black tracking-tighter uppercase">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Data Pembayar */}
                <Card className="overflow-hidden border-0 shadow-premium bg-white">
                    <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 sm:size-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                                    <UserCheck className="size-5 sm:size-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight truncate">Data Pembayar</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">Nama pembayar {type.includes('FITRAH') ? 'zakat' : 'mal'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center sm:justify-end gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-center sm:self-auto">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMuzakkiCount(Math.max(1, muzakkiCount - 1))}
                                    className="rounded-xl size-9 hover:bg-white hover:shadow-sm"
                                >
                                    <Trash2 className="size-4 text-red-400" />
                                </Button>
                                <Input
                                    type="number"
                                    min="1"
                                    value={muzakkiCount}
                                    onChange={(e) => setMuzakkiCount(parseInt(e.target.value) || 1)}
                                    className="text-center w-12 font-black text-sm bg-transparent border-0 focus-visible:ring-0 p-0"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMuzakkiCount(muzakkiCount + 1)}
                                    className="rounded-xl size-9 hover:bg-white hover:shadow-sm"
                                >
                                    <Plus className="size-4 text-emerald-500" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[224px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                            {names.map((name, idx) => (
                                <div key={idx} className="group/input relative flex items-center transition-all duration-300">
                                    <div className="absolute left-6 text-[10px] font-black text-emerald-200 group-hover/input:text-emerald-500 transition-colors">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </div>
                                    <Input
                                        placeholder={`Nama Pembayar ${idx + 1}...`}
                                        value={name}
                                        onChange={(e) => {
                                            const newNames = [...names]
                                            newNames[idx] = e.target.value
                                            setNames(newNames)
                                        }}
                                        required
                                        className="pl-14 h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/10 font-bold text-emerald-950 transition-all placeholder:text-gray-300 placeholder:font-normal"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 3: Nominal (Dynamic) */}
                <Card className="overflow-hidden border-0 shadow-premium bg-white">
                    <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="size-10 sm:size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                                <Calculator className="size-5 sm:size-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight truncate">Kalkulasi Nominal</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">Sesuaikan nominal per jiwa</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {type === "FITRAH_UANG" && (
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nominal per Jiwa</Label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black">Rp</div>
                                        <Input
                                            type="text"
                                            value={formatCurrency(amountPerPerson)}
                                            onChange={(e) => setAmountPerPerson(parseCurrency(e.target.value))}
                                            className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 font-mono text-lg sm:text-xl font-black text-emerald-950"
                                        />
                                    </div>
                                </div>
                            )}
                            {type === "FITRAH_BERAS" && (
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beras per Jiwa</Label>
                                    <div className="relative">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 font-black">Liter</div>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={amountRicePerPerson || ""}
                                            onChange={(e) => setAmountRicePerPerson(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                            className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-mono text-lg sm:text-xl font-black text-emerald-950"
                                        />
                                    </div>
                                </div>
                            )}
                            {type === "MAL" && (
                                <div className="space-y-3 col-span-full">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Zakat Mal</Label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black">Rp</div>
                                        <Input
                                            type="text"
                                            value={formatCurrency(amountPerPerson)}
                                            onChange={(e) => setAmountPerPerson(parseCurrency(e.target.value))}
                                            className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 font-mono text-lg sm:text-xl font-black text-emerald-950"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Infaq / Sedekah</Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-black">Rp</div>
                                    <Input
                                        type="text"
                                        placeholder="0"
                                        value={formatCurrency(infaqAmount)}
                                        onChange={(e) => setInfaqAmount(parseCurrency(e.target.value))}
                                        className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 font-mono text-lg sm:text-xl font-black text-emerald-950"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="lg:col-span-5 relative">
                <div className="lg:sticky lg:top-28">
                    <Card className="overflow-hidden border-0 shadow-2xl bg-emerald-950 text-white group">
                        <div className="absolute inset-0 arabic-pattern opacity-5 pointer-events-none" />

                        <CardContent className="p-8 sm:p-10 space-y-8 sm:space-y-10 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        <Receipt className="size-5" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">Ringkasan</h2>
                                </div>
                                <div className="text-[10px] sm:text-[10px] font-black text-emerald-400/60 uppercase tracking-widest bg-emerald-900/50 px-3 py-1.5 rounded-full border border-emerald-800">
                                    Live Preview
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-emerald-100/60 font-medium text-sm">Zakat ({names.length} Orang)</span>
                                    <span className="text-xl font-black tracking-tight group-hover:text-emerald-400 transition-colors">
                                        {type === "FITRAH_BERAS"
                                            ? `${totalZakatBeras} L`
                                            : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalZakatUang ?? 0)
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-emerald-100/60 font-medium text-sm">Infaq / Sedekah</span>
                                    <span className="text-xl font-black tracking-tight group-hover:text-emerald-400 transition-colors">
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(infaqAmount)}
                                    </span>
                                </div>

                                <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-800 to-transparent" />

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Total Tagihan</span>
                                        <p className="text-sm text-emerald-100/40">Zakat & Infaq Terakumulasi</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-4xl font-black text-emerald-400 tracking-tighter">
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalBayar)}
                                        </h3>
                                        {type === "FITRAH_BERAS" && totalZakatBeras > 0 && <span className="text-xs font-black text-blue-400">+ {totalZakatBeras} L Beras</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Uang Diterima (Rp)</Label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black">Rp</div>
                                        <Input
                                            type="text"
                                            className="h-20 bg-white/5 border-emerald-800/50 text-white text-3xl font-black rounded-3xl pl-16 focus-visible:ring-emerald-500 focus-visible:bg-white/10 transition-all border-2"
                                            placeholder="0"
                                            value={formatCurrency(paymentAmount)}
                                            onChange={(e) => setPaymentAmount(parseCurrency(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className={cn(
                                    "p-6 rounded-3xl flex justify-between items-center transition-all duration-500",
                                    kembalian < 0 ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                )}>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest">{kembalian < 0 ? 'Kekurangan' : 'Kembalian'}</span>
                                        <span className="text-2xl font-black tracking-tight">
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(kembalian)}
                                        </span>
                                    </div>
                                    <div className={cn("size-12 rounded-2xl flex items-center justify-center", kembalian < 0 ? "bg-rose-500/20" : "bg-emerald-500/20")}>
                                        <Calculator className="size-6" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-20 text-xl font-black bg-emerald-500 hover:bg-emerald-400 text-white rounded-3xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] group"
                            >
                                {loading ? (
                                    <Loader2 className="size-8 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-4">
                                        <Save className="size-6 group-hover:rotate-12 transition-transform" />
                                        {initialData?.receiptId || originalId ? "Simpan Perubahan" : "Konfirmasi & Simpan"}
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-950 font-bold transition-all group"
                    >
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Batalkan dan Kembali
                    </button>
                </div>
            </div>
        </form>
    )
}
