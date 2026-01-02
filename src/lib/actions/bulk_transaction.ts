"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TransactionType } from "@prisma/client"
import { randomUUID } from "crypto"

export type BulkTransactionData = {
    type: TransactionType
    muzakkiNames: string[]
    amountPerPerson: number // For Fitrah Uang or Mal (total for Mal?)
    amountRicePerPerson?: number | null // For Fitrah Beras
    infaqAmount: number
    paymentAmount: number
    kembalian: number
    description?: string
}

/**
 * Mencatat transaksi grup (beberapa muzakki sekaligus).
 * Menggunakan $transaction untuk memastikan atomisitas data (semua tersimpan atau tidak sama sekali).
 */
export async function createBulkTransaction(data: BulkTransactionData) {
    const receiptId = randomUUID() // Unique ID for this batch

    try {
        await prisma.$transaction(async (tx) => {
            for (const name of data.muzakkiNames) {
                await tx.transaction.create({
                    data: {
                        type: data.type,
                        amount: data.amountPerPerson,
                        amount_rice: data.type === 'FITRAH_BERAS' ? data.amountRicePerPerson : null,
                        description: data.description,
                        receiptId: receiptId,
                        muzakkiName: name,
                        paymentAmount: data.paymentAmount,
                        kembalian: data.kembalian
                    } as any
                });
            }

            // Tambahkan transaksi Infaq secara terpisah jika ada nominalnya
            if (data.infaqAmount > 0) {
                await tx.transaction.create({
                    data: {
                        type: 'INFAQ',
                        amount: data.infaqAmount,
                        description: 'Infaq tambahan via transaksi grup',
                        receiptId: receiptId,
                        muzakkiName: data.muzakkiNames[0] || "Hamba Allah",
                        paymentAmount: data.paymentAmount,
                        kembalian: data.kembalian
                    } as any
                })
            }
        })

        revalidatePath("/transaksi")
        revalidatePath("/")

        return { success: true, receiptId }
    } catch (error) {
        console.error("Bulk transaction error:", error)
        return { success: false, error: "Gagal menyimpan transaksi" }
    }
}

/**
 * Memperbarui transaksi grup dengan cara menghapus data lama dan menulis ulang data baru.
 * Menjamin integritas data menggunakan database transaction.
 */
export async function updateBulkTransaction(receiptId: string | null | undefined, data: BulkTransactionData, originalId?: number) {
    try {
        let finalReceiptId = receiptId || randomUUID();

        await prisma.$transaction(async (tx) => {
            // 1. Hapus data lama (baik bulk via receiptId atau satuan via originalId)
            if (receiptId) {
                await tx.transaction.deleteMany({ where: { receiptId: receiptId } });
            } else if (originalId) {
                await tx.transaction.delete({ where: { id: originalId } });
            }

            // 2. Tulis ulang data transaksi yang baru
            for (const name of data.muzakkiNames) {
                await tx.transaction.create({
                    data: {
                        type: data.type,
                        amount: data.amountPerPerson,
                        amount_rice: data.type === 'FITRAH_BERAS' ? data.amountRicePerPerson : null,
                        description: data.description,
                        receiptId: finalReceiptId,
                        muzakkiName: name,
                        paymentAmount: data.paymentAmount,
                        kembalian: data.kembalian
                    } as any
                });
            }

            if (data.infaqAmount > 0) {
                await tx.transaction.create({
                    data: {
                        type: 'INFAQ',
                        amount: data.infaqAmount,
                        description: 'Infaq tambahan via transaksi grup',
                        receiptId: finalReceiptId,
                        muzakkiName: data.muzakkiNames[0] || "Hamba Allah",
                        paymentAmount: data.paymentAmount,
                        kembalian: data.kembalian
                    } as any
                })
            }
        })

        revalidatePath("/transaksi")
        revalidatePath("/")
        return { success: true, receiptId: finalReceiptId }
    } catch (error) {
        console.error("Update bulk transaction error:", error)
        return { success: false, error: "Gagal memperbarui transaksi" }
    }
}

