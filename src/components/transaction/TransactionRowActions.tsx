"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Edit2, Trash2, Printer, Loader2 } from "lucide-react"
import { deleteTransaction, deleteTransactionsByReceiptId, getTransactionsByReceiptId } from "@/lib/actions/transaction"
import ReceiptModal from "./ReceiptModal"
import { AlertDialog } from "@/components/ui/AlertDialog"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TransactionRowActionsProps {
    transaction: any
    currentUserRole?: 'ADMINISTRATOR' | 'PANITIA_ZIS'
}

export default function TransactionRowActions({ transaction, currentUserRole }: TransactionRowActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)
    const [receiptData, setReceiptData] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // State for generic alerts (Validation, Error, Logic)
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: "",
        description: "",
        variant: "default" as "default" | "destructive" | "warning"
    })

    const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }))

    const showAccessDenied = () => {
        setAlertState({
            isOpen: true,
            title: "Akses Ditolak",
            description: "Hanya Administrator yang memiliki izin untuk menghapus data transaksi ini.",
            variant: "destructive"
        })
    }

    const showLoginRequired = () => {
        setAlertState({
            isOpen: true,
            title: "Login Diperlukan",
            description: "Anda harus login terlebih dahulu untuk melakukan tindakan ini.",
            variant: "warning"
        })
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const res = transaction.receiptId
            ? await deleteTransactionsByReceiptId(transaction.receiptId)
            : await deleteTransaction(transaction.id)

        if (!res.success) {
            setAlertState({
                isOpen: true,
                title: "Gagal Menghapus",
                description: res.error || "Terjadi kesalahan saat menghapus transaksi.",
                variant: "destructive"
            })
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        } else {
            // Success - Next.js revalidate handles UI
            setIsDeleteDialogOpen(false)
        }
    }

    const onEditClick = (e: React.MouseEvent) => {
        if (!currentUserRole) {
            e.preventDefault()
            showLoginRequired()
        }
    }

    const onDeleteClick = () => {
        if (!currentUserRole) {
            showLoginRequired()
            return
        }
        if (currentUserRole !== 'ADMINISTRATOR') {
            showAccessDenied()
            return
        }
        setIsDeleteDialogOpen(true)
    }

    const handlePrint = async () => {
        if (!currentUserRole) {
            showLoginRequired()
            return
        }

        setIsPrinting(true)

        let transactions = []
        if (transaction.receiptId) {
            transactions = await getTransactionsByReceiptId(transaction.receiptId)
        } else {
            transactions = [transaction]
        }

        if (transactions.length === 0) {
            setAlertState({
                isOpen: true,
                title: "Data Tidak Ditemukan",
                description: "Gagal memuat data transaksi untuk dicetak. Silahkan coba lagi.",
                variant: "destructive"
            })
            setIsPrinting(false)
            return
        }

        // Aggregate data for receipt
        const type = transactions[0].type
        const names = transactions.filter((t: any) => t.type !== "INFAQ").map((t: any) => t.muzakkiName).filter(Boolean)
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
            kembalian: transactions[0].kembalian || 0,
            officerName: transaction.officerName || (transactions[0] as any).createdBy?.nama_lengkap
        })

        setIsModalOpen(true)
        setIsPrinting(false)
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className={cn("size-8 hover:bg-blue-50", !currentUserRole ? "text-gray-300 hover:text-gray-400" : "text-blue-600 hover:text-blue-700")}
                asChild={!!currentUserRole}
                onClick={!currentUserRole ? onEditClick : undefined}
            >
                {currentUserRole ? (
                    <Link href={`/transaksi/${transaction.id}/edit`}>
                        <Edit2 className="size-4" />
                    </Link>
                ) : (
                    <div className="cursor-pointer">
                        <Edit2 className="size-4" />
                    </div>
                )}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={cn("size-8 hover:bg-emerald-50", !currentUserRole ? "text-gray-300 hover:text-gray-400" : "text-emerald-600 hover:text-emerald-700")}
                onClick={handlePrint}
                disabled={isPrinting}
            >
                {isPrinting ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={cn("size-8 hover:bg-red-50", !currentUserRole || currentUserRole !== 'ADMINISTRATOR' ? "text-gray-300 hover:text-gray-400" : "text-red-600 hover:text-red-700")}
                onClick={onDeleteClick}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </Button>

            <ReceiptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={receiptData}
            />

            {/* Confirmation Dialog for Deletion */}
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

            {/* Generic Alert Dialog (Access Denied, Login Required, etc) */}
            <AlertDialog
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                onConfirm={closeAlert}
                title={alertState.title}
                description={alertState.description}
                confirmText="Mengerti"
                cancelText="Tutup"
                variant={alertState.variant}
            />
        </div>
    )
}
