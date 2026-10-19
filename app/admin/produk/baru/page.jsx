import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk, pastikanAdmin } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanTambahProduk({ searchParams }) {
  // Pastikan admin sudah login
  const auth = await pastikanAdmin();
  if (!auth) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const pesanError = params?.error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>

      {pesanError && (
        <div className="max-w-xl rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      <FormProduk labelTombol="Simpan produk" action={tambahProduk} />
    </div>
  );
}
