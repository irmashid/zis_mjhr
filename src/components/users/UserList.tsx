"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { createUser, updateUser, deleteUser } from "@/lib/actions/users"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AlertDialog } from "@/components/ui/AlertDialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select"

interface User {
    id: string
    username: string
    nama_lengkap: string
    role: 'ADMINISTRATOR' | 'PANITIA_ZIS'
}

interface UserListProps {
    users: User[]
    currentUserRole: 'ADMINISTRATOR' | 'PANITIA_ZIS'
}

export function UserList({ users, currentUserRole }: UserListProps) {
    const router = useRouter()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5

    // Popup state
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Generic Alert Config
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        variant: "default" as "default" | "destructive" | "warning",
        confirmText: "Ok",
        cancelText: "Tutup"
    })

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }))

    const handleActionClick = (action: 'add' | 'edit' | 'delete', user?: User) => {
        if (currentUserRole !== 'ADMINISTRATOR') {
            setAlertConfig({
                isOpen: true,
                title: "Akses Ditolak",
                description: "Hanya Administrator yang memiliki akses untuk mengelola user.",
                variant: "destructive",
                confirmText: "Mengerti",
                cancelText: "Tutup"
            })
            return
        }

        if (action === 'add') {
            setIsAddOpen(true)
        } else if (action === 'edit' && user) {
            setSelectedUser(user)
            setIsEditOpen(true)
        } else if (action === 'delete' && user) {
            setDeleteId(user.id)
            setShowDeleteDialog(true)
        }
    }

    const handleDelete = async (id: string) => {
        setIsLoading(true)
        const res = await deleteUser(id)
        setIsLoading(false)
        if (res.success) {
            router.refresh()
        } else {
            setAlertConfig({
                isOpen: true,
                title: "Gagal Menghapus",
                description: res.message || "Gagal menghapus user",
                variant: "destructive",
                confirmText: "Coba Lagi",
                cancelText: "Tutup"
            })
        }
    }

    const totalPages = Math.ceil(users.length / pageSize)
    const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-emerald-950">Manajemen User</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daftar Akun Pengguna</p>
                </div>
                <Button
                    onClick={() => handleActionClick('add')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20"
                >
                    <Plus className="size-4 mr-2" />
                    Tambah User
                </Button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{user.username}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{user.nama_lengkap}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                            user.role === 'ADMINISTRATOR'
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-blue-100 text-blue-700"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleActionClick('edit', user)}
                                                className="h-8 w-8 p-0 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            {user.username !== 'irmashid' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleActionClick('delete', user)}
                                                    className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Slide Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 py-4 px-8 bg-gray-50/30 border-t border-gray-100/50">
                    <div className="flex items-center gap-4">
                        <div className="text-[11px] font-black text-emerald-950 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                            <span className="text-emerald-600">{currentPage}</span>
                            <span className="mx-1 text-gray-300">/</span>
                            <span className="text-emerald-600">{totalPages || 1}</span>
                            <span className="ml-2 text-gray-400 font-bold lowercase tracking-normal">dari {users.length} data</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="size-8 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-20"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                                className="size-8 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-20"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals placed here or separate components */}
            {isAddOpen && (
                <UserFormModal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    mode="create"
                />
            )}

            {isEditOpen && selectedUser && (
                <UserFormModal
                    isOpen={isEditOpen}
                    onClose={() => { setIsEditOpen(false); setSelectedUser(null); }}
                    mode="update"
                    user={selectedUser}
                />
            )}

            <AlertDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={() => {
                    if (deleteId) handleDelete(deleteId);
                    setShowDeleteDialog(false);
                }}
                title="Hapus User"
                description="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
                variant="destructive"
            />

            <AlertDialog
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                onConfirm={closeAlert}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
            />
        </div>
    )
}

// Sub-component for form to keep it clean
function UserFormModal({ isOpen, onClose, mode, user }: { isOpen: boolean, onClose: () => void, mode: 'create' | 'update', user?: User }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        variant: "default" as "default" | "destructive" | "warning"
    })

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }))

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        let res;
        if (mode === 'create') {
            res = await createUser(null, formData)
        } else {
            formData.append('id', user?.id || '')
            res = await updateUser(null, formData)
        }

        setIsLoading(false)

        if (res.success) {
            router.refresh()
            onClose()
        } else {
            setAlertConfig({
                isOpen: true,
                title: "Gagal Menyimpan",
                description: res.message || "Gagal menyimpan data user",
                variant: "destructive"
            })
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-emerald-950">
                        {mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
                        <X className="size-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Username</Label>
                        <Input
                            name="username"
                            defaultValue={user?.username}
                            required
                            minLength={3}
                            placeholder="Masukkan username"
                            className="bg-gray-50/50 border-gray-100 focus:bg-white"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Nama Lengkap</Label>
                        <Input
                            name="nama_lengkap"
                            defaultValue={user?.nama_lengkap}
                            required
                            minLength={5}
                            placeholder="Nama Lengkap User"
                            className="bg-gray-50/50 border-gray-100 focus:bg-white"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                            {mode === 'create' ? 'Password' : 'Password (Opsional)'}
                        </Label>
                        <Input
                            name="password"
                            type="password"
                            required={mode === 'create'}
                            minLength={5}
                            placeholder={mode === 'create' ? "••••••••" : "Kosongkan jika tidak ingin mengganti"}
                            className="bg-gray-50/50 border-gray-100 focus:bg-white"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Role</Label>
                        <div className="relative">
                            <Select name="role" defaultValue={user?.role || 'PANITIA_ZIS'}>
                                <SelectTrigger className="bg-gray-50/50 border-0 focus:ring-emerald-500/50">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                                    <SelectItem value="PANITIA_ZIS">Panitia ZIS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider mt-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Simpan'}
                    </Button>
                </form>
            </div>
            <AlertDialog
                isOpen={alertConfig.isOpen}
                onClose={closeAlert}
                onConfirm={closeAlert}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                confirmText="Mengerti"
                cancelText="Tutup"
            />
        </div>
    )
}
