"use server";

import { redirect } from "next/navigation";
import { buatKoneksiSesi } from "@/lib/supabase/server";

/**
 * Server Action untuk login admin memakai Supabase Auth
 */
export async function masuk(prevState, formData) {
  // Menangani panggilan langsung via <form action={masuk}> maupun useActionState
  const isDirect = prevState instanceof FormData;
  const data = isDirect ? prevState : formData;

  const email = data?.get("email");
  const password = data?.get("password");

  if (!email || !password) {
    const pesan = "Email dan password wajib diisi.";
    if (isDirect) {
      redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  const supabase = await buatKoneksiSesi();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    const pesan =
      error.message === "Invalid login credentials"
        ? "Email atau password salah."
        : error.message || "Gagal masuk. Periksa email dan password.";

    if (isDirect) {
      redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  redirect("/admin");
}

/**
 * Server Action untuk logout admin
 */
export async function keluar() {
  const supabase = await buatKoneksiSesi();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export const login = masuk;
export const logout = keluar;

