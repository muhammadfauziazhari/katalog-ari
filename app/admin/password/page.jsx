import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanGantiPassword({ searchParams }) {
  const params = await searchParams;
  const pesanError = params?.error;
  const pesanBerhasil = params?.berhasil;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ganti password</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
        </p>
      </div>

      {pesanError && (
        <div className="max-w-sm rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      {pesanBerhasil && (
        <div className="max-w-sm rounded-lg border border-garis bg-permukaan p-3 text-sm font-semibold text-utama">
          {pesanBerhasil}
        </div>
      )}

      <form action={gantiPassword} className="flex max-w-sm flex-col gap-4">
        <Input
          label="Password baru"
          name="password_baru"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Ulangi password baru"
          name="konfirmasi_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Tombol type="submit" className="self-start">
          Simpan password
        </Tombol>
      </form>
    </div>
  );
}
