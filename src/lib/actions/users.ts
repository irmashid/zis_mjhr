'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

const userSchema = z.object({
    username: z.string().min(3),
    nama_lengkap: z.string().min(5),
    password: z.string().min(5).optional(), // Optional for update
    role: z.enum(['ADMINISTRATOR', 'PANITIA_ZIS']),
})

export async function createUser(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'ADMINISTRATOR') {
        return { success: false, message: 'Hanya Administrator yang memiliki akses.' }
    }

    const data = Object.fromEntries(formData)
    const result = userSchema.safeParse({ ...data, password: data.password || undefined })

    if (!result.success) {
        return { success: false, message: 'Data tidak valid. Periksa minimal karakter.' }
    }

    if (!data.password) {
        return { success: false, message: 'Password wajib diisi.' }
    }

    try {
        const hashedPassword = await hash(data.password as string, 10)
        await prisma.user.create({
            data: {
                username: result.data.username,
                nama_lengkap: result.data.nama_lengkap,
                password_hash: hashedPassword,
                role: result.data.role,
            },
        })
        revalidatePath('/users')
        return { success: true, message: 'User berhasil ditambahkan.' }
    } catch (error) {
        return { success: false, message: 'Username sudah digunakan atau error sistem.' }
    }
}

export async function updateUser(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'ADMINISTRATOR') {
        return { success: false, message: 'Hanya Administrator yang memiliki akses.' }
    }

    const id = formData.get('id') as string
    const data = Object.fromEntries(formData)

    // Validation usually requires password only if provided
    const parseData = { ...data }
    if (parseData.password === '') delete parseData.password;

    // We need to validate specific fields manually or adjust schema
    // For simplicity, checking strict lengths directly
    if (String(data.username).length < 3) return { success: false, message: 'Username minimal 3 karakter.' }
    if (String(data.nama_lengkap).length < 5) return { success: false, message: 'Nama lengkap minimal 5 karakter.' }

    try {
        const updateData: any = {
            username: data.username,
            nama_lengkap: data.nama_lengkap,
            role: data.role,
        }

        if (data.password) {
            if (String(data.password).length < 5) return { success: false, message: 'Password baru minimal 5 karakter.' }
            updateData.password_hash = await hash(data.password as string, 10)
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        })
        revalidatePath('/users')
        return { success: true, message: 'User berhasil diupdate.' }
    } catch (error) {
        return { success: false, message: 'Gagal mengupdate user.' }
    }
}

export async function deleteUser(id: string) {
    const session = await getSession()
    if (!session || session.role !== 'ADMINISTRATOR') {
        return { success: false, message: 'Hanya Administrator yang memiliki akses.' }
    }

    try {
        // Fetch current user data from database to check latest role
        const userToDelete = await prisma.user.findUnique({
            where: { id },
            select: { role: true, username: true }
        })

        if (!userToDelete) {
            return { success: false, message: 'User tidak ditemukan.' }
        }

        // Prevent deleting administrator accounts
        if (userToDelete.role === 'ADMINISTRATOR') {
            return { success: false, message: 'Tidak dapat menghapus akun Administrator.' }
        }

        await prisma.user.delete({ where: { id } })
        revalidatePath('/users')
        return { success: true, message: 'User berhasil dihapus.' }
    } catch (e) {
        return { success: false, message: 'Gagal menghapus user.' }
    }
}
