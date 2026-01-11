'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { createSession, logout as destroySession, getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { logActivity } from './activity'

const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(5),
    role: z.enum(['ADMINISTRATOR', 'PANITIA_ZIS']),
})

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return {
            success: false,
            message: 'Input tidak valid. Periksa kembali data Anda.',
        }
    }

    const { username, password, role } = result.data

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return {
                success: false,
                message: 'Username tidak ditemukan.',
            }
        }

        if (user.role !== role) {
            return {
                success: false,
                message: 'Role tidak sesuai dengan akun ini.',
            }
        }

        const passwordMatch = await compare(password, user.password_hash)

        if (!passwordMatch) {
            return {
                success: false,
                message: 'Password salah.',
            }
        }

        await createSession(user.id, user.username, user.nama_lengkap, user.role)
        await logActivity("LOGIN", `${user.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${user.nama_lengkap} baru saja login.`)

    } catch (error) {
        console.error('Login error:', error)
        return {
            success: false,
            message: 'Terjadi kesalahan sistem.',
        }
    }

    redirect('/')
}

export async function logout() {
    const session = await getSession()
    if (session) {
        await logActivity("LOGOUT", `${session.role === 'ADMINISTRATOR' ? 'Administrator' : 'Panitia ZIS'} dengan nama lengkap ${session.nama_lengkap} baru saja logout.`)
    }
    await destroySession()
    redirect('/login')
}
