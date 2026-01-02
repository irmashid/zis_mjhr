"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, defs, linearGradient, stop } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TrendingUp } from "lucide-react"

interface DashboardChartProps {
    data: {
        date: string
        total: number
    }[]
}

export function DashboardChart({ data }: DashboardChartProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-premium bg-white group h-full">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardHeader className="p-6 sm:p-8 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                    <div className="size-10 sm:size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                        <TrendingUp className="size-5 sm:size-6" />
                    </div>
                    <div>
                        <CardTitle className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight">Tren Penerimaan</CardTitle>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">7 Hari Terakhir</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 pb-6 sm:pb-8">
                <div className="h-[300px] w-full px-4 sm:px-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '20px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '12px 16px'
                                }}
                                itemStyle={{
                                    fontSize: '12px',
                                    fontWeight: '900',
                                    color: '#064e3b'
                                }}
                                labelStyle={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: '#94a3b8',
                                    marginBottom: '4px',
                                    textTransform: 'uppercase'
                                }}
                                formatter={(value: number) => [
                                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value),
                                    'Total'
                                ]}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#10b981"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
