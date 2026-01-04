"use server"

import { prisma } from "@/lib/prisma"

/**
 * Mengambil statistik dashboard berdasarkan rentang tanggal tertentu.
 * Digunakan untuk menampilkan scorecard dan grafik tren di halaman utama.
 */
export async function getDashboardStats(startDate?: string, endDate?: string) {
    try {
        const where: any = {}
        // Filter berdasarkan rentang waktu jika parameter disediakan
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) {
                const end = new Date(endDate)
                // Set ke akhir hari (23:59:59) untuk memastikan data hari terakhir ikut terhitung
                end.setHours(23, 59, 59, 999)
                where.createdAt.lte = end
            }
        }

        const transactions = await prisma.transaction.findMany({
            where,
            select: { type: true, amount: true, amount_rice: true, muzakkiName: true, createdAt: true } as any
        })

        // Hitung jumlah muzakki unik berdasarkan nama
        const uniqueMuzakki = new Set(transactions.map(t => (t as any).muzakkiName))
        const totalMuzakki = uniqueMuzakki.size

        // Calculate totals in JS to avoid complex group by logic if enum handling is tricky, 
        // but groupBy is better. Let's use simple reduction for clarity and Type safety.
        let totalUang = 0
        let totalBeras = 0
        let breakdown = {
            FITRAH_UANG: 0,
            FITRAH_BERAS: 0,
            MAL: 0,
            INFAQ: 0,
            SODAQOH: 0
        }

        // Siapkan data untuk grafik 7 hari terakhir
        const dailyDataMap: Record<string, number> = {}
        const dailyRiceMap: Record<string, number> = {}
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return date.toISOString().split('T')[0]
        }).reverse()

        // Initialize map
        last7Days.forEach(day => {
            dailyDataMap[day] = 0
            dailyRiceMap[day] = 0
        })

        transactions.forEach(t => {
            if (t.amount) totalUang += t.amount
            if (t.amount_rice) totalBeras += t.amount_rice

            // Kelompokkan nominal berdasarkan tipe transaksi
            if (t.type in breakdown) {
                // @ts-ignore
                breakdown[t.type] += (t.type === 'FITRAH_BERAS' ? (t.amount_rice || 0) : t.amount)
            }

            // Akumulasi data harian untuk grafik (hanya jika tanggal masuk dalam 7 hari terakhir)
            const day = (t as any).createdAt.toISOString().split('T')[0]
            if (day in dailyDataMap) {
                dailyDataMap[day] += (t.amount || 0)
                dailyRiceMap[day] += (t.amount_rice || 0)
            }
        })

        const chartData = last7Days.map(day => ({
            date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(day)),
            total: dailyDataMap[day],
            rice: dailyRiceMap[day]
        }))

        return {
            totalUang,
            totalBeras,
            totalMuzakki,
            breakdown,
            chartData
        }
    } catch (error) {
        console.error("Stats error:", error)
        return {
            totalUang: 0,
            totalBeras: 0,
            totalMuzakki: 0,
            breakdown: { FITRAH_UANG: 0, FITRAH_BERAS: 0, MAL: 0, INFAQ: 0, SODAQOH: 0 },
            recentTransactions: []
        }
    }
}
