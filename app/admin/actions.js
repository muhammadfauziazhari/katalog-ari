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

/**
 * Server Action untuk ganti password admin yang sedang login
 */
export async function gantiPassword(prevState, formData) {
  const isDirect = prevState instanceof FormData;
  const data = isDirect ? prevState : formData;

  const passwordBaru = data?.get("password_baru");
  const konfirmasiPassword = data?.get("konfirmasi_password");

  // Periksa autentikasi di server
  const supabase = await buatKoneksiSesi();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const pesan = "Sesi telah berakhir. Silakan login terlebih dahulu.";
    if (isDirect) {
      redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  // Validasi password baru minimal 8 karakter
  if (!passwordBaru || String(passwordBaru).length < 8) {
    const pesan = "Password baru minimal 8 karakter.";
    if (isDirect) {
      redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  // Validasi konfirmasi password harus sama
  if (passwordBaru !== konfirmasiPassword) {
    const pesan = "Konfirmasi password tidak cocok dengan password baru.";
    if (isDirect) {
      redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  // Update password di Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    const pesan = error.message || "Gagal mengganti password.";
    if (isDirect) {
      redirect(`/admin/password?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  const pesanSukses = "Password berhasil diganti.";
  if (isDirect) {
    redirect(`/admin/password?berhasil=${encodeURIComponent(pesanSukses)}`);
  }
  return { berhasil: pesanSukses };
}

export const login = masuk;
export const logout = keluar;
export const ubahPassword = gantiPassword;
export const updatePassword = gantiPassword;
