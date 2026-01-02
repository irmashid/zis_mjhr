import { createClient } from '@supabase/supabase-js'

/**
 * Inisialisasi Supabase Client.
 * Digunakan untuk fitur-fitur seperti Storage, Auth, atau Realtime jika diperlukan di masa depan.
 * Untuk data transaksi utama, kita tetap menggunakan Prisma (PostgreSQL).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rwhusuyweqktnuzutzza.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const supabase = createClient(supabaseUrl, supabaseKey)
