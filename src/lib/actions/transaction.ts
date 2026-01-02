"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TransactionType } from "@prisma/client"

export type TransactionData = {
    type: TransactionType
    amount: number
    amount_rice?: number | null
    description?: string | null
    muzakkiName: string
    paymentAmount?: number
    kembalian?: number
}

/**
 * Mengambil daftar transaksi dengan dukungan filter tanggal, pencarian, dan pagination.
 * Fungsi ini juga mengelompokkan data berdasarkan receiptId untuk tampilan grup (bulk).
 */
export async function getTransactions(
    startDate?: string,
    endDate?: string,
    query?: string,
    page: number = 1,
    pageSize: number = 10
) {
    try {
        const where: any = {}
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                where.createdAt.lte = end
            }
        }

        if (query) {
            where.OR = [
                { receiptId: { contains: query } },
                { muzakkiName: { contains: query } } as any
            ]
        }

        const rawTransactions = await prisma.transaction.findMany({
            where,
            orderBy: { createdAt: "desc" },
        })

        // Logika Pengelompokan: Menggabungkan transaksi dengan receiptId yang sama
        const groups: Record<string, any> = {}
        const singles: any[] = []

        rawTransactions.forEach(t => {
            if (t.receiptId) {
                if (!groups[t.receiptId]) {
                    groups[t.receiptId] = {
                        id: t.id, // Reference ID
                        receiptId: t.receiptId,
                        createdAt: t.createdAt,
                        names: new Set(),
                        totalAmount: 0,
                        totalRice: 0,
                        type: t.type,
                        description: t.description,
                        isBulk: true
                    }
                }

                // Aggregate
                if ((t as any).muzakkiName) groups[t.receiptId].names.add((t as any).muzakkiName)

                if (t.type === 'INFAQ') {
                    groups[t.receiptId].totalAmount += t.amount
                } else {
                    groups[t.receiptId].type = t.type // Use non-infaq type as primary
                    groups[t.receiptId].totalAmount += t.amount
                    groups[t.receiptId].totalRice += (t.amount_rice || 0)
                }
            } else {
                singles.push({
                    ...t,
                    names: new Set([(t as any).muzakkiName || ""]),
                    totalAmount: t.amount,
                    totalRice: t.amount_rice || 0,
                    isBulk: false
                })
            }
        })

        // Gabungkan grup dan transaksi tunggal, lalu urutkan berdasarkan waktu terbaru
        const groupedData = [...Object.values(groups), ...singles]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Slicing data untuk pagination
        const totalItems = groupedData.length
        const totalPages = Math.ceil(totalItems / pageSize)
        const startIndex = (page - 1) * pageSize
        const paginatedData = groupedData.slice(startIndex, startIndex + pageSize)

        const finalData = paginatedData.map(g => ({
            ...g,
            names: Array.from(g.names as Set<string>),
            muzakki: { name: Array.from(g.names as Set<string>).join(", ") } // For compatibility
        }))

        return {
            data: finalData,
            metadata: {
                total: totalItems,
                totalPages,
                currentPage: page,
                pageSize
            }
        }
    } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return {
            data: [],
            metadata: { total: 0, totalPages: 0, currentPage: 1, pageSize: 10 }
        }
    }
}

/**
 * Menambahkan satu transaksi baru ke database.
 */
export async function createTransaction(data: TransactionData) {
    try {
        await prisma.transaction.create({
            data: {
                type: data.type,
                amount: data.amount,
                amount_rice: data.amount_rice,
                description: data.description,
                muzakkiName: data.muzakkiName,
                paymentAmount: data.paymentAmount,
                kembalian: data.kembalian
            } as any,
        })
        revalidatePath("/transaksi")
        revalidatePath("/") // Perbarui statistik di dashboard
        return { success: true }
    } catch (error) {
        console.error("Create transaction error:", error)
        return { success: false, error: "Gagal mencatat transaksi" }
    }
}
export async function getTransactionById(id: number) {
    try {
        return await prisma.transaction.findFirst({
            where: { id },
        })
    } catch (error) {
        console.error("Failed to fetch transaction:", error)
        return null
    }
}

export async function getTransactionsByReceiptId(receiptId: string) {
    try {
        return await prisma.transaction.findMany({
            where: { receiptId },
        })
    } catch (error) {
        console.error("Failed to fetch transactions by receiptId:", error)
        return []
    }
}

/**
 * Memperbarui data transaksi yang sudah ada.
 */
export async function updateTransaction(id: number, data: TransactionData) {
    try {
        await prisma.transaction.update({
            where: { id },
            data: {
                type: data.type,
                amount: data.amount,
                amount_rice: data.amount_rice,
                description: data.description,
                muzakkiName: data.muzakkiName,
                paymentAmount: data.paymentAmount,
                kembalian: data.kembalian
            } as any,
        })
        revalidatePath("/transaksi")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Update transaction error:", error)
        return { success: false, error: "Gagal memperbarui data" }
    }
}

export async function deleteTransaction(id: number) {
    try {
        await prisma.transaction.delete({
            where: { id },
        })
        revalidatePath("/transaksi")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to delete transaction" }
    }
}

export async function deleteTransactionsByReceiptId(receiptId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.transaction.deleteMany({ where: { receiptId } })
        })
        revalidatePath("/transaksi")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete bulk transactions:", error)
        return { success: false, error: "Gagal menghapus grup transaksi" }
    }
}
