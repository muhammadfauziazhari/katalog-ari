"use client";

import { useRef, useState } from "react";
import { buatDeskripsiDenganAI } from "@/app/admin/actions";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action }) {
  const formRef = useRef(null);
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [sedangMembuat, setSedangMembuat] = useState(false);
  const [pesanErrorAI, setPesanErrorAI] = useState("");

  async function buatDeskripsi() {
    const data = new FormData(formRef.current);
    setPesanErrorAI("");
    setSedangMembuat(true);

    try {
      const hasil = await buatDeskripsiDenganAI(
        data.get("nama"),
        data.get("kategori")
      );

      if (hasil.error) {
        setPesanErrorAI(hasil.error);
        return;
      }

      setDeskripsi(hasil.deskripsi);
    } catch {
      setPesanErrorAI(
        "Terjadi kesalahan saat membuat deskripsi. Silakan coba lagi."
      );
    } finally {
      setSedangMembuat(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="flex max-w-xl flex-col gap-4"
    >
      {produk?.id && <input type="hidden" name="id" value={produk.id} />}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <div className="flex flex-col gap-2">
        <Input
          label="Deskripsi"
          name="deskripsi"
          textarea
          value={deskripsi}
          onChange={(event) => setDeskripsi(event.target.value)}
        />
        <div className="flex flex-col items-start gap-2">
          <Tombol
            type="button"
            varian="garis"
            onClick={buatDeskripsi}
            disabled={sedangMembuat}
            aria-busy={sedangMembuat}
          >
            {sedangMembuat ? "Sedang membuat..." : "Buat deskripsi dengan AI"}
          </Tombol>
          {pesanErrorAI && (
            <p className="text-sm text-bahaya" role="alert">
              {pesanErrorAI}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
