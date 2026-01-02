"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { CheckCircle2, ArrowLeft, Home, History } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditSuccessPage() {
    const router = useRouter()

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <CardContent className="p-12 text-center space-y-8">
                        {/* Animated Icon */}
                        <div className="relative mx-auto size-24">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse" />
                            <div className="absolute inset-2 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="size-12 text-white" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-3">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                Perubahan data berhasil disimpan
                            </h1>
                            <p className="text-slate-500 font-medium">
                                Data transaksi telah diperbarui dan disinkronkan ke dalam sistem.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 space-y-3">
                            <Link href="/transaksi" className="block">
                                <Button
                                    className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <History className="size-5" />
                                    Riwayat Transaksi
                                </Button>
                            </Link>

                            <Link href="/" className="block">
                                <Button
                                    variant="ghost"
                                    className="w-full h-12 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Home className="size-4" />
                                    Kembali ke Beranda
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
