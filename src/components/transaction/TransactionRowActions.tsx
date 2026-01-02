"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Edit2, Trash2, Printer, Loader2 } from "lucide-react"
import { deleteTransaction, deleteTransactionsByReceiptId, getTransactionsByReceiptId } from "@/lib/actions/transaction"
import ReceiptModal from "./ReceiptModal"
import { AlertDialog } from "@/components/ui/AlertDialog"
import Link from "next/link"

interface TransactionRowActionsProps {
    transaction: any
}

export default function TransactionRowActions({ transaction }: TransactionRowActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)
    const [receiptData, setReceiptData] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        const res = transaction.receiptId
            ? await deleteTransactionsByReceiptId(transaction.receiptId)
            : await deleteTransaction(transaction.id)

        if (!res.success) {
            alert(res.error || "Gagal menghapus transaksi")
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        } else {
            // Success - Next.js revalidate handles UI
            setIsDeleteDialogOpen(false)
        }
    }

    const handlePrint = async () => {
        setIsPrinting(true)

        let transactions = []
        if (transaction.receiptId) {
            transactions = await getTransactionsByReceiptId(transaction.receiptId)
        } else {
            transactions = [transaction]
        }

        if (transactions.length === 0) {
            alert("Gagal memuat data cetak")
            setIsPrinting(false)
            return
        }

        // Aggregate data for receipt
        const type = transactions[0].type
        const names = transactions.map((t: any) => t.muzakkiName).filter(Boolean)
        const totalZakatUang = transactions.filter((t: any) => t.type !== "FITRAH_BERAS" && t.type !== "INFAQ").reduce((acc: number, curr: any) => acc + curr.amount, 0)
        const totalZakatBeras = transactions.filter((t: any) => t.type === "FITRAH_BERAS").reduce((acc: number, curr: any) => acc + (curr.amount_rice || 0), 0)
        const infaqAmount = transactions.filter((t: any) => t.type === "INFAQ").reduce((acc: number, curr: any) => acc + curr.amount, 0)
        const totalBayar = totalZakatUang + infaqAmount

        setReceiptData({
            id: transaction.receiptId || `TX-${transaction.id}`,
            date: new Date(transaction.createdAt).toLocaleString("id-ID"),
            names,
            type,
            totalZakatUang,
            totalZakatBeras,
            infaqAmount,
            totalBayar,
            paymentAmount: transactions[0].paymentAmount || totalBayar,
            kembalian: transactions[0].kembalian || 0
        })

        setIsModalOpen(true)
        setIsPrinting(false)
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="size-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                asChild
            >
                <Link href={`/transaksi/${transaction.id}/edit`}>
                    <Edit2 className="size-4" />
                </Link>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={handlePrint}
                disabled={isPrinting}
            >
                {isPrinting ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </Button>

            <ReceiptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={receiptData}
            />

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Hapus Transaksi?"
                description={transaction.receiptId
                    ? "Tindakan ini akan menghapus seluruh grup transaksi ini secara permanen. Data yang sudah dihapus tidak dapat dikembalikan."
                    : "Tindakan ini akan menghapus data transaksi ini secara permanen dari sistem."}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="destructive"
            />
        </div>
    )
}
