import { getTransactionById, getTransactionsByReceiptId } from "@/lib/actions/transaction"
import UnifiedTransactionForm from "@/components/transaction/UnifiedTransactionForm"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth/session"

interface EditTransactionPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
    const { id } = await params
    const session = await getSession()
    const transaction = await getTransactionById(parseInt(id))

    if (!transaction) {
        notFound()
    }

    let transactions = []
    if (transaction.receiptId) {
        transactions = await getTransactionsByReceiptId(transaction.receiptId)
    } else {
        transactions = [transaction]
    }

    // Pisahkan transaksi Infaq dan Zakat
    const infaqTx = transactions.find(t => t.type === 'INFAQ')
    const zakatTxs = transactions.filter(t => t.type !== 'INFAQ')

    if (zakatTxs.length === 0) {
        // Ini seharusnya tidak terjadi untuk grup transaksi yang valid, tapi tetap ditangani
        notFound()
    }

    const firstZakat = zakatTxs[0]
    const totalZakatUang = zakatTxs.reduce((acc, t) => acc + (t.amount || 0), 0)
    const totalInfaq = infaqTx?.amount || 0
    const initialData = {
        receiptId: transaction.receiptId || undefined,
        type: firstZakat.type,
        muzakkiCount: zakatTxs.length,
        names: zakatTxs.map(t => t.muzakkiName || ""),
        amountPerPerson: firstZakat.type === 'MAL' ? firstZakat.amount : (firstZakat.amount || 0),
        amountRicePerPerson: firstZakat.amount_rice || 0,
        infaqAmount: totalInfaq,
        paymentAmount: firstZakat.paymentAmount ?? (totalZakatUang + totalInfaq)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/transaksi">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl">
                            <Edit className="size-6 text-emerald-600" />
                        </div>
                        Edit Transaksi {transaction.receiptId ? '(Grup)' : ''}
                    </h1>
                    <p className="text-gray-500 ml-12">
                        {transaction.receiptId ? `ID Struk: ${transaction.receiptId.split('-')[0]}` : `Muzakki: ${transaction.muzakkiName}`}
                    </p>
                </div>
            </div>

            <div className="p-1">
                <UnifiedTransactionForm initialData={initialData} originalId={transaction.id} currentUserRole={session?.role} currentUserName={session?.nama_lengkap} />
            </div>
        </div>
    )
}

