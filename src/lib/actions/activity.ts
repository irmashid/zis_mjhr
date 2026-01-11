"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { revalidatePath } from "next/cache"

export async function logActivity(action: string, details: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: "No session found" }

        await prisma.activityLog.create({
            data: {
                userId: session.userId,
                action,
                details
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to log activity:", error)
        return { success: false, error: "Failed to log activity" }
    }
}

export async function getActivityLogs(page: number = 1, pageSize: number = 5, startDate?: string, endDate?: string) {
    try {
        // Auto-cleanup: Hapus log yang sudah lebih dari 90 hari
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        await prisma.activityLog.deleteMany({
            where: {
                createdAt: {
                    lt: ninetyDaysAgo
                }
            }
        })

        const skip = (page - 1) * pageSize

        // Build where clause for filtering
        const where: any = {}
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) {
                where.createdAt.gte = new Date(startDate)
            }
            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                where.createdAt.lte = end
            }
        }

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    user: {
                        select: {
                            nama_lengkap: true,
                            role: true
                        }
                    }
                }
            }),
            prisma.activityLog.count({ where })
        ])

        return {
            logs,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    } catch (error) {
        console.error("Failed to fetch activity logs:", error)
        return { logs: [], total: 0, totalPages: 0 }
    }
}
