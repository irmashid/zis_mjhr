"use client"

import { Menu, User, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { SessionPayload } from "@/lib/auth/session"
import { logout } from "@/lib/actions/auth"
import Link from "next/link"
import { useState } from "react"
import { AlertDialog } from "@/components/ui/AlertDialog"

interface HeaderProps {
    onToggleSidebar: () => void
    session: SessionPayload | null
}

export function Header({ onToggleSidebar, session }: HeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);

    return (
        <header className="flex h-20 items-center justify-between px-4 md:px-8 glass sticky top-0 z-40 border-b border-emerald-900/5 mt-0">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="md:hidden rounded-2xl text-emerald-600 hover:bg-emerald-50"
                >
                    <Menu className="size-6" />
                </Button>
                <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Lokasi Masjid</p>
                    <h2 className="text-[10px] md:text-xs font-bold text-emerald-950/60 flex items-center gap-2 line-clamp-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        Pegangsaan Dua, Jakarta Utara
                    </h2>
                </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
                {session ? (
                    <>
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <p className="text-[10px] font-black text-emerald-900 uppercase">
                                {session.role === 'ADMINISTRATOR' ? session.nama_lengkap : session.nama_lengkap}
                            </p>
                            <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest">
                                {session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'}
                            </p>
                        </div>
                        <div className="relative">
                            <div
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="size-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group cursor-pointer transition-transform hover:scale-105"
                            >
                                <User className="size-5" />
                            </div>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 flex flex-col gap-1">
                                        <div className="px-3 py-2 border-b border-gray-100 mb-1 sm:hidden">
                                            <p className="text-xs font-black text-emerald-900">{session.role === 'ADMINISTRATOR' ? session.nama_lengkap : session.nama_lengkap}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{session.role.replace('_', ' ')}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                setIsLogoutAlertOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                                        >
                                            <LogOut className="size-3.5" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        {isLogoutAlertOpen && (
                            <AlertDialog
                                isOpen={true}
                                onClose={() => setIsLogoutAlertOpen(false)}
                                onConfirm={() => {
                                    setIsLogoutAlertOpen(false);
                                    logout();
                                }}
                                title="Konfirmasi Logout"
                                description="Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan berakhir."
                                confirmText="Logout"
                                cancelText="Batal"
                                variant="destructive"
                            />
                        )}
                    </>
                ) : (
                    <>
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <p className="text-[10px] font-black text-emerald-900 uppercase">Guest</p>
                            <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest">Mode Tamu</p>
                        </div>
                        <div className="relative">
                            <div
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="size-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center shadow-inner hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                                <span className="text-sm font-black">G</span>
                            </div>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 flex flex-col gap-1">
                                        <div className="px-3 py-2 border-b border-gray-100 mb-1 sm:hidden">
                                            <p className="text-xs font-black text-emerald-900">Guest</p>
                                            <p className="text-[10px] text-gray-400 font-bold">Mode Tamu</p>
                                        </div>
                                        <Link href="/login" onClick={() => setIsProfileOpen(false)}>
                                            <button
                                                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors w-full text-left"
                                            >
                                                <LogIn className="size-3.5" />
                                                Login Sekarang
                                            </button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    )
}

