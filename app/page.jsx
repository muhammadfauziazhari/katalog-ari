import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { buatKoneksiServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const kategori = params?.kategori || "";

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = buatKoneksiServer();

    // Ambil daftar kategori yang unik dari database
    const { data: katData } = await supabase.from("produk").select("kategori");
    if (katData) {
      daftarKategori = Array.from(
        new Set(katData.map((p) => p.kategori).filter(Boolean))
      ).sort();
    }

    // Query produk dengan filter pencarian dan/atau kategori di sisi server
    let query = supabase.from("produk").select("*");

    if (q && q.trim()) {
      query = query.ilike("nama", `%${q.trim()}%`);
    }

    if (kategori && kategori.trim()) {
      query = query.eq("kategori", kategori.trim());
    }

    query = query.order("id", { ascending: true });

    const { data, error } = await query;

    if (error) {
      pesanError = error.message || "Gagal mengambil data produk dari database.";
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan saat menghubungkan ke database.";
  }

  const isFiltered = Boolean(q.trim() || kategori.trim());

  // Helper untuk membuat link filter dengan mempertahankan parameter pencarian
  function buatLinkFilter(targetKategori) {
    const queryObj = new URLSearchParams();
    if (q && q.trim()) queryObj.set("q", q.trim());
    if (targetKategori) queryObj.set("kategori", targetKategori);
    const qs = queryObj.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian */}
          <form method="GET" action="/" className="flex w-full items-center gap-2 sm:max-w-xs">
            {kategori && <input type="hidden" name="kategori" value={kategori} />}
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Cari produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
            >
              Cari
            </button>
            {isFiltered && (
              <Link
                href="/"
                className="whitespace-nowrap text-xs text-teks-lembut underline hover:text-utama"
              >
                Reset
              </Link>
            )}
          </form>
        </div>

        {/* Filter Kategori */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            <Link
              href={buatLinkFilter("")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                !kategori
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
              }`}
            >
              Semua
            </Link>
            {daftarKategori.map((kat) => (
              <Link
                key={kat}
                href={buatLinkFilter(kat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  kategori === kat
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                }`}
              >
                {kat}
              </Link>
            ))}
          </div>
        )}

        {/* Status Error / Kosong / Hasil Produk */}
        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
            <p className="font-semibold">Gagal memuat produk</p>
            <p className="mt-1 text-sm text-teks-lembut">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <div className="flex flex-col items-start gap-2 py-8 text-teks-lembut">
            <p>{isFiltered ? "Produk tidak ditemukan" : "Belum ada produk"}</p>
            {isFiltered && (
              <Link href="/" className="text-sm font-semibold text-utama underline underline-offset-4">
                Lihat semua produk
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
