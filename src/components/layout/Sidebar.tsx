"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Receipt, CreditCard, Droplets, Coins, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transaksi Zakat", href: "/transaksi", icon: CreditCard },
    // { name: "Laporan", href: "/laporan", icon: Receipt },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-emerald-950 transition-transform duration-300 transform md:relative md:translate-x-0 md:z-auto h-screen overflow-hidden border-r",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Arabic Pattern Overlay */}
                <div className="absolute inset-0 arabic-pattern opacity-10 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex h-24 items-center justify-between px-8">
                        <Link href="/" className="flex items-center gap-4 group/logo" onClick={onClose}>
                            <div className="relative size-12 overflow-hidden rounded-2xl shadow-premium bg-white p-1 transition-transform duration-500 group-hover/logo:scale-110">
                                <img
                                    src="/logo_irmashid.png"
                                    alt="Logo IRMASHID"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tighter leading-none">ZIS MJHR</span>
                                <span className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mt-1">Management System</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <nav className="space-y-2">
                            {navigation.map((item, index) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold transition-all duration-300 relative group/nav",
                                            isActive
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white"
                                        )}
                                    >
                                        <item.icon className={cn("size-5 transition-transform duration-300 group-hover/nav:scale-110", isActive ? "text-white" : "text-emerald-400/50")} />
                                        <span className="tracking-tight">{item.name}</span>
                                        {isActive && (
                                            <div className="absolute right-4 size-1.5 rounded-full bg-white animate-pulse" />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        <div className="rounded-3xl bg-emerald-900/50 border border-emerald-800/50 p-6 backdrop-blur-sm group/footer overflow-hidden relative mb-4">
                            <div className="absolute top-0 right-0 p-4 opacity-40 group-hover/footer:scale-125 group-hover/footer:rotate-12 transition-transform duration-500">
                                <MapPin className="size-12 text-white" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <MapPin className="size-3" />
                                    Masjid Jami'
                                </p>
                                <p className="text-xs font-bold text-white leading-relaxed opacity-80">Hidayaturrahmah</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">© 2026 | IRMASHID</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
