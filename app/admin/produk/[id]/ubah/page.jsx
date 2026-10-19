import { notFound, redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk, pastikanAdmin } from "@/app/admin/actions";
import { buatKoneksiServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params, searchParams }) {
  // Pastikan admin sudah login
  const auth = await pastikanAdmin();
  if (!auth) {
    redirect("/admin/login");
  }

  const { id } = await params;

  let produk = null;
  try {
    const supabase = buatKoneksiServer();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      produk = data;
    }
  } catch {
    // Abaikan error dan teruskan ke notFound jika produk tidak didapatkan
  }

  if (!produk) {
    notFound();
  }

  const queryParams = await searchParams;
  const pesanError = queryParams?.error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>

      {pesanError && (
        <div className="max-w-xl rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      <FormProduk produk={produk} labelTombol="Simpan perubahan" action={ubahProduk} />
    </div>
  );
}
