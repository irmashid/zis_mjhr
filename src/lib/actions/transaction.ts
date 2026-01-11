"use server"

import { randomUUID } from "crypto"
import { logActivity } from "./activity"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TransactionType } from "@prisma/client"
import { getSession } from "@/lib/auth/session"

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
    pageSize: number = 5
) {
    try {
        const where: Record<string, any> = {}
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
            include: {
                createdBy: {
                    select: {
                        nama_lengkap: true
                    }
                }
            }
        })

        // Logika Pengelompokan: Menggabungkan transaksi dengan receiptId yang sama
        const groups: Record<string, any> = {}
        const singles: any[] = []

        rawTransactions.forEach(t => {
            const officerName = (t as any).createdBy?.nama_lengkap || "Unknown"

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
                        officerName: officerName, // Add officer name to group
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
                    officerName: officerName, // Add officer name to single
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
        console.error("Gagal mengambil data transaksi:", error)
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
    const session = await getSession()
    if (!session || (session.role !== 'ADMINISTRATOR' && session.role !== 'PANITIA_ZIS')) {
        return { success: false, error: "Anda tidak memiliki akses untuk mencatat transaksi." }
    }

    try {
        await prisma.transaction.create({
            data: {
                type: data.type,
                amount: data.amount,
                amount_rice: data.amount_rice,
                description: data.description,
                muzakkiName: data.muzakkiName,
                paymentAmount: data.paymentAmount,
                kembalian: data.kembalian,
                createdById: session.userId,
                updatedById: session.userId
            } as any,
        })
        revalidatePath("/transaksi")
        revalidatePath("/") // Perbarui statistik di dashboard
        return { success: true }
    } catch (error) {
        console.error("Error saat mencatat transaksi:", error)
        return { success: false, error: "Gagal mencatat transaksi" }
    }
}
export async function getTransactionById(id: number) {
    try {
        return await prisma.transaction.findFirst({
            where: { id },
        })
    } catch (error) {
        console.error("Gagal mengambil data transaksi berdasarkan ID:", error)
        return null
    }
}

export async function getTransactionsByReceiptId(receiptId: string) {
    try {
        return await prisma.transaction.findMany({
            where: { receiptId },
            include: {
                createdBy: {
                    select: {
                        nama_lengkap: true
                    }
                }
            }
        })
    } catch (error) {
        console.error("Gagal mengambil data transaksi berdasarkan receiptId:", error)
        return []
    }
}

/**
 * Memperbarui data transaksi yang sudah ada.
 */
export async function updateTransaction(id: number, data: TransactionData) {
    const session = await getSession()
    if (!session || (session.role !== 'ADMINISTRATOR' && session.role !== 'PANITIA_ZIS')) {
        return { success: false, error: "Anda tidak memiliki akses untuk mengubah transaksi." }
    }

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
                kembalian: data.kembalian,
                updatedById: session.userId
            } as any,
        })
        revalidatePath("/transaksi")
        revalidatePath("/")

        await logActivity("UPDATE_TRANSACTION", `${session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${session.nama_lengkap} baru saja mengedit data transaksi dengan ID transaksi TX-${id}.`)

        return { success: true }
    } catch (error) {
        console.error("Error saat memperbarui transaksi:", error)
        return { success: false, error: "Gagal memperbarui data" }
    }
}

export async function deleteTransaction(id: number) {
    const session = await getSession()
    if (!session || session.role !== 'ADMINISTRATOR') {
        return { success: false, error: "Hanya Administrator yang dapat menghapus transaksi." }
    }

    try {
        await prisma.transaction.delete({
            where: { id },
        })
        revalidatePath("/transaksi")
        revalidatePath("/")

        await logActivity("DELETE_TRANSACTION", `${session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${session.nama_lengkap} baru saja menghapus data transaksi dengan ID transaksi TX-${id}.`)

        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Gagal menghapus transaksi" }
    }
}

export async function deleteTransactionsByReceiptId(receiptId: string) {
    const session = await getSession()
    if (!session || session.role !== 'ADMINISTRATOR') {
        return { success: false, error: "Hanya Administrator yang dapat menghapus transaksi." }
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.transaction.deleteMany({ where: { receiptId } })
        })
        revalidatePath("/transaksi")
        revalidatePath("/")

        await logActivity("DELETE_BATCH", `${session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${session.nama_lengkap} baru saja menghapus grup transaksi dengan ID Struk ${receiptId.split('-')[0]}.`)

        return { success: true }
    } catch (error) {
        console.error("Gagal menghapus grup transaksi:", error)
        return { success: false, error: "Gagal menghapus grup transaksi" }
    }
}
