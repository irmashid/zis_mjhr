import UnifiedTransactionForm from "@/components/transaction/UnifiedTransactionForm"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/auth/session"

export default async function NewTransactionPage() {
    const session = await getSession()
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/transaksi">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Input Data Transaksi</h1>
            </div>

            <div className="p-1">
                <UnifiedTransactionForm currentUserRole={session?.role} currentUserName={session?.nama_lengkap} />
            </div>
        </div>
    )
}
