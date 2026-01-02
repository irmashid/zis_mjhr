import { Menu } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface HeaderProps {
    onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
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
                <div className="hidden sm:flex flex-col items-end mr-2">
                    <p className="text-[10px] font-black text-emerald-900 uppercase">Administrator</p>
                    <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest">Active Session</p>
                </div>
                <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group cursor-pointer transition-transform hover:scale-105">
                    <span className="text-sm font-black">A</span>
                </div>
            </div>
        </header>
    )
}
