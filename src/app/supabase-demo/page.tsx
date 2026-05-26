import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import ElegantBackground from '@/components/elegant-bg'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetching data from Supabase
  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-[#1A1A1A] p-6 font-sans relative overflow-hidden">
      {/* Aesthetic background elements */}
      <ElegantBackground />

      <div className="w-full max-w-md bg-[#F5F5F5] border border-zinc-200 p-8 shadow-2xl relative z-10">
        <h1 className="text-xl font-bold uppercase tracking-wider text-[#C9A961] mb-6 text-center border-b border-zinc-200 pb-4">
          Supabase Demo: Daftar Todos
        </h1>
        {error ? (
          <div className="text-[#B33A3A] text-xs bg-red-50 border border-red-200 p-4 mb-4 text-center">
            Error: {error.message}
            <p className="text-[10px] text-zinc-500 mt-2">
              Pastikan Anda sudah membuat tabel `todos` dengan kolom `id` dan `name` di Supabase Anda.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos && todos.length > 0 ? (
              todos.map((todo: any) => (
                <li key={todo.id} className="p-3 bg-white border border-zinc-200 flex items-center justify-between hover:border-[#C9A961] transition-colors">
                  <span className="text-sm font-medium">{todo.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-650 font-semibold tracking-wider uppercase">ID: {todo.id}</span>
                </li>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">
                Tidak ada data todo ditemukan. Silakan tambahkan beberapa baris data ke tabel `todos` di Supabase.
              </p>
            )}
          </ul>
        )}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs uppercase tracking-wider text-[#C9A961] hover:text-black transition-colors"
          >
            &larr; Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  )
}
