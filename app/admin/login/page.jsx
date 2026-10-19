import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { masuk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanLogin({ searchParams }) {
  const params = await searchParams;
  const pesanError = params?.error;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Masuk admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">Khusus pemilik toko untuk mengelola produk.</p>
      </div>
      {pesanError && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}
      <form action={masuk} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Tombol type="submit">Masuk</Tombol>
      </form>
    </div>
  );
}
