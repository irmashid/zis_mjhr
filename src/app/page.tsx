import { getDashboardStats } from "@/lib/actions/dashboard_stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, Coins, TrendingUp, ShoppingBag, Wheat, Wallet, HeartHandshake, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardDateFilter } from "@/components/dashboard/DashboardDateFilter"
import { DashboardChart } from "@/components/dashboard/DashboardChart"

/**
 * Halaman Dashboard Utama.
 * Menampilkan ringkasan statistik dan grafik tren penerimaan.
 */
export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Ambil parameter filter dari URL (Server Side)
  const searchParams = await props.searchParams
  const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined

  // Ambil data statistik berdasarkan filter tanggal
  const stats = await getDashboardStats(startDate, endDate)

  // Format stats for UI cards
  const cards = [
    {
      title: "Uang",
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalUang - stats.breakdown.MAL - stats.breakdown.INFAQ - (stats.breakdown.SODAQOH || 0)),
      label: "Total Zakat Fitrah Uang",
      icon: Coins,
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Beras",
      value: `${stats.totalBeras} Liter`,
      label: "Total Zakat Fitrah Beras",
      icon: Wheat,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Mal",
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.breakdown.MAL),
      label: "Total Zakat Mal",
      icon: Wallet,
      gradient: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      title: "Infaq",
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.breakdown.INFAQ),
      label: "Total Infaq",
      icon: HeartHandshake,
      gradient: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: "Muzakki",
      value: `${stats.totalMuzakki} Orang`,
      label: "Total Muzakki",
      icon: UserCheck,
      gradient: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600"
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-10 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950 tracking-tight">Dashboard</h1>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Ringkasan Statistik Real-time</p>
        </div>
        <DashboardDateFilter />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, idx) => (
          <Card key={idx} className="overflow-hidden border-0 shadow-xl bg-white group hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-0">
              <div className={`h-1 w-full bg-gradient-to-r ${card.gradient}`} />
              <div className="p-3.5 sm:p-5 flex flex-col justify-between h-full min-h-[120px] sm:min-h-[140px]">
                <div className="flex items-center justify-between gap-2">
                  <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl ${card.bgColor} ${card.textColor} group-hover:scale-110 transition-transform duration-500 shrink-0 shadow-sm`}>
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 opacity-70 truncate">
                      {card.title}
                    </p>
                    <div className={cn(
                      "font-black tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full",
                      card.value.length > 15 ? "text-sm sm:text-base" :
                        card.value.length > 10 ? "text-base sm:text-lg" : "text-lg sm:text-xl",
                      card.textColor
                    )}>
                      {card.value}
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                    <div className={cn("h-full bg-gradient-to-r", card.gradient, "opacity-20 w-3/4")} />
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold mt-1.5 italic line-clamp-1 leading-tight uppercase tracking-tight">
                    {card.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-12 xl:col-span-8">
          <DashboardChart data={stats.chartData || []} />
        </div>

        {/* Breakdown Card */}
        <Card className="lg:col-span-12 xl:col-span-4 overflow-hidden border-0 shadow-xl bg-emerald-950 text-white relative group">
          <div className="absolute inset-0 arabic-pattern opacity-10 pointer-events-none" />
          <CardHeader className="p-6 sm:p-8 relative z-10 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="size-10 sm:size-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-sm shrink-0">
                <TrendingUp className="size-5 sm:size-6" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-black tracking-tight">Rincian Penerimaan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6 relative z-10">
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: "Zakat Fitrah (Uang)", value: stats.breakdown.FITRAH_UANG, icon: Coins, color: "text-emerald-400" },
                { label: "Zakat Fitrah (Beras)", value: `${stats.breakdown.FITRAH_BERAS} L`, icon: Wheat, color: "text-blue-400" },
                { label: "Zakat Mal", value: stats.breakdown.MAL, icon: Wallet, color: "text-amber-400" },
                { label: "Infaq & Sedekah", value: stats.breakdown.INFAQ + (stats.breakdown.SODAQOH || 0), icon: HeartHandshake, color: "text-pink-400" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 sm:p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={cn("p-1.5 sm:p-2 rounded-xl bg-white/5 shadow-sm shrink-0", item.color)}>
                      <item.icon className="size-3.5 sm:size-4" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-50/70 uppercase tracking-wider truncate">{item.label}</span>
                  </div>
                  <span className="font-black text-xs sm:text-sm tracking-tight text-white shrink-0 ml-2">
                    {typeof item.value === 'string'
                      ? item.value
                      : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.value)}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-800 to-transparent" />

            <div className="p-5 sm:p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Total Saldo Masuk</p>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter shadow-sm">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalUang)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}
