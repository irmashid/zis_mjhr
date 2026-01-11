import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { UserList } from "@/components/users/UserList"

export default async function UsersPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    // Double check role protection (Middleware handles it, but good to be safe)
    if (session.role !== 'ADMINISTRATOR' && session.role !== 'PANITIA_ZIS') {
        redirect('/')
    }

    const users = await prisma.user.findMany({
        orderBy: { created_at: 'desc' }
    })

    // Prisma enums might return as string in JSON object sometimes or strictly enum
    // We map it to ensure it matches the component's expected types 
    const formattedUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        nama_lengkap: u.nama_lengkap,
        role: u.role as 'ADMINISTRATOR' | 'PANITIA_ZIS'
    })).sort((a, b) => {
        if (a.username === 'irmashid') return -1
        if (b.username === 'irmashid') return 1
        return 0 // Keep existing order from Prisma (created_at desc) for others
    })

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <UserList users={formattedUsers} currentUserRole={session.role} />
        </div>
    )
}
