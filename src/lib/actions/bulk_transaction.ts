"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TransactionType } from "@prisma/client"
import { randomUUID } from "crypto"
import { getSession } from "@/lib/auth/session"
import { logActivity } from "./activity"

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
    const session = await getSession()
    if (!session || (session.role !== 'ADMINISTRATOR' && session.role !== 'PANITIA_ZIS')) {
        return { success: false, error: "Anda tidak memiliki akses untuk mencatat transaksi." }
    }

    const receiptId = randomUUID() // Unique ID for this batch

    try {
        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < data.muzakkiNames.length; i++) {
                const name = data.muzakkiNames[i];
                // Untuk Zakat Mal, nominal hanya disimpan pada baris pertama agar tidak berlipat saat dijumlah (agregasi)
                const amount = (data.type === 'MAL' && i > 0) || data.type === 'FITRAH_BERAS'
                    ? 0
                    : data.amountPerPerson;

                await tx.transaction.create({
                    data: {
                        type: data.type,
                        amount: amount,
                        amount_rice: data.type === 'FITRAH_BERAS' ? data.amountRicePerPerson : null,
                        description: data.description,
                        receiptId: receiptId,
                        muzakkiName: name,
                        paymentAmount: data.paymentAmount,
                        kembalian: data.kembalian,
                        createdById: session.userId,
                        updatedById: session.userId
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
                        kembalian: data.kembalian,
                        createdById: session.userId,
                        updatedById: session.userId
                    } as any
                })
            }
        })

        revalidatePath("/transaksi")
        revalidatePath("/")

        await logActivity("CREATE_BATCH", `${session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${session.nama_lengkap} baru saja menginput data transaksi (Batch) dengan ID Struk ${receiptId.split('-')[0]}.`)

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
    const session = await getSession()
    if (!session || (session.role !== 'ADMINISTRATOR' && session.role !== 'PANITIA_ZIS')) {
        return { success: false, error: "Anda tidak memiliki akses untuk mengubah transaksi." }
    }

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
            for (let i = 0; i < data.muzakkiNames.length; i++) {
                const name = data.muzakkiNames[i];
                // Untuk Zakat Mal, nominal hanya disimpan pada baris pertama agar tidak berlipat saat dijumlah (agregasi)
                const amount = (data.type === 'MAL' && i > 0) || data.type === 'FITRAH_BERAS'
                    ? 0
                    : data.amountPerPerson;

                await tx.transaction.create({
                    data: {
                        type: data.type,
                        amount: amount,
                        amount_rice: data.type === 'FITRAH_BERAS' ? data.amountRicePerPerson : null,
                        description: data.description,
                        receiptId: finalReceiptId,
                        muzakkiName: name,
                        paymentAmount: data.paymentAmount,
                        kembalian: data.kembalian,
                        createdById: session.userId,
                        updatedById: session.userId
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
                        kembalian: data.kembalian,
                        createdById: session.userId,
                        updatedById: session.userId
                    } as any
                })
            }
        })

        revalidatePath("/transaksi")
        revalidatePath("/")

        await logActivity("UPDATE_BATCH", `${session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${session.nama_lengkap} baru saja mengedit data transaksi (Batch) dengan ID Struk ${finalReceiptId.split('-')[0]}.`)

        return { success: true, receiptId: finalReceiptId }
    } catch (error) {
        console.error("Update bulk transaction error:", error)
        return { success: false, error: "Gagal memperbarui transaksi" }
    }
}

