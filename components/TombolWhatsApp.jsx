"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  if (!produk) return null;

  const [jumlah, setJumlah] = useState(1);

  // Ambil daftar varian jika kolom/properti varian tersedia
  let daftarVarian = [];
  if (Array.isArray(produk.varian)) {
    daftarVarian = produk.varian;
  } else if (typeof produk.varian === "string" && produk.varian.trim()) {
    daftarVarian = produk.varian
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  const [varianDipilih, setVarianDipilih] = useState(
    daftarVarian.length > 0 ? daftarVarian[0] : ""
  );

  const nomor = toko.nomorWhatsApp ? String(toko.nomorWhatsApp).replace(/\D/g, "") : "";
  const totalHarga = (Number(produk.harga) || 0) * jumlah;
  const teksVarian = varianDipilih ? ` (varian: ${varianDipilih})` : "";

  const pesan = `Halo, saya ingin memesan ${produk.nama}${teksVarian} sebanyak ${jumlah} buah dengan total harga ${formatRupiah(totalHarga)}.`;
  const urlWa = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Pilihan varian jika tersedia */}
      {daftarVarian.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-teks">Pilih Varian:</label>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVarianDipilih(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  varianDipilih === v
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pilihan jumlah (minimal 1) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-teks">Jumlah:</label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
              disabled={jumlah <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-l-lg text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:cursor-not-allowed disabled:text-garis"
              aria-label="Kurangi jumlah"
            >
              −
            </button>
            <span className="flex h-10 w-12 items-center justify-center font-bold text-teks">
              {jumlah}
            </span>
            <button
              type="button"
              onClick={() => setJumlah((prev) => prev + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-r-lg text-lg font-bold text-teks transition-colors hover:bg-permukaan"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
          {jumlah > 1 && (
            <p className="text-sm text-teks-lembut">
              Total:{" "}
              <span className="font-bold text-harga">{formatRupiah(totalHarga)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Tombol Pesan via WhatsApp */}
      <a
        href={urlWa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
