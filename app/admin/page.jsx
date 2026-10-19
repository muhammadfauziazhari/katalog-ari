import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKoneksiSesi, buatKoneksiServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  // Pastikan admin sudah login
  const supabaseSesi = await buatKoneksiSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const pesanBerhasil = params?.berhasil;

  let daftarProduk = [];
  let pesanError = null;

  try {
    let { data, error } = await supabaseSesi
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      // Fallback ke server client jika diperlukan
      const supabaseServer = buatKoneksiServer();
      const resServer = await supabaseServer
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (!resServer.error) {
        data = resServer.data;
        error = null;
      } else {
        pesanError = error.message || resServer.error.message;
      }
    }

    if (!error) {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan saat memuat data produk.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanBerhasil && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm font-semibold text-utama">
          {pesanBerhasil}
        </div>
      )}

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm text-teks-lembut">{pesanError}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
