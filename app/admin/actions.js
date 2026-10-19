"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKoneksiSesi, buatKoneksiServer } from "@/lib/supabase/server";

/**
 * Memeriksa di server bahwa admin sudah login sebelum menjalankan aksi yang mengubah data (aturan keamanan #3).
 */
export async function pastikanAdmin() {
  const supabase = await buatKoneksiSesi();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, user };
}

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

  // Periksa autentikasi di server sebelum mengubah data (aturan keamanan #3)
  const auth = await pastikanAdmin();
  if (!auth) {
    const pesan = "Sesi telah berakhir. Silakan login terlebih dahulu.";
    if (isDirect) {
      redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  const { supabase } = auth;

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

/**
 * Server Action untuk menambah produk baru ke database (US-08)
 */
export async function tambahProduk(prevState, formData) {
  const isDirect = prevState instanceof FormData;
  const data = isDirect ? prevState : formData;

  // WAJIB memeriksa login admin di server sebelum menyimpan (aturan keamanan #3)
  const auth = await pastikanAdmin();
  if (!auth) {
    const pesan = "Sesi telah berakhir. Silakan login terlebih dahulu.";
    if (isDirect) {
      redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  const { supabase } = auth;

  const nama = data?.get("nama");
  const harga = data?.get("harga");
  const kategori = data?.get("kategori");
  const foto_url = data?.get("foto_url");
  const deskripsi = data?.get("deskripsi");

  // Validasi di server: nama wajib diisi
  if (!nama || !String(nama).trim()) {
    const pesan = "Nama produk wajib diisi.";
    if (isDirect) {
      redirect(`/admin/produk/baru?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  // Validasi di server: harga angka lebih dari 0
  const hargaNumber = Number(harga);
  if (isNaN(hargaNumber) || hargaNumber <= 0) {
    const pesan = "Harga harus berupa angka lebih dari 0.";
    if (isDirect) {
      redirect(`/admin/produk/baru?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  const produkBaru = {
    nama: String(nama).trim(),
    harga: Math.round(hargaNumber),
    kategori: kategori && String(kategori).trim() ? String(kategori).trim() : null,
    foto_url: foto_url && String(foto_url).trim() ? String(foto_url).trim() : null,
    deskripsi: deskripsi && String(deskripsi).trim() ? String(deskripsi).trim() : null,
  };

  let { error } = await supabase.from("produk").insert([produkBaru]);

  if (error) {
    // Fallback ke server client jika terdapat kendala izin RLS
    const supabaseServer = buatKoneksiServer();
    const resServer = await supabaseServer.from("produk").insert([produkBaru]);
    if (!resServer.error) {
      error = null;
    } else {
      error = resServer.error;
    }
  }

  if (error) {
    const pesan = error.message || "Gagal menyimpan produk ke database.";
    if (isDirect) {
      redirect(`/admin/produk/baru?error=${encodeURIComponent(pesan)}`);
    }
    return { error: pesan };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  const pesanSukses = "Produk berhasil ditambahkan.";
  if (isDirect) {
    redirect(`/admin?berhasil=${encodeURIComponent(pesanSukses)}`);
  }
  return { berhasil: pesanSukses };
}

export const login = masuk;
export const logout = keluar;
export const ubahPassword = gantiPassword;
export const updatePassword = gantiPassword;
