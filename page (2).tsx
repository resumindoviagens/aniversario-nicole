import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nicoleCream via-white to-nicoleRose p-5">
      <div className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-20 w-20 text-nicolePink" />
        <p className="mt-5 text-sm font-black uppercase tracking-[.25em] text-nicoleGold">Check-in realizado</p>
        <h1 className="mt-3 text-4xl font-black text-nicoleBlue">Presença confirmada!</h1>
        <p className="mt-4 text-lg text-nicoleBlue/75">Sua confirmação foi enviada com sucesso. A Nicole ficará muito feliz com sua presença.</p>
        <Link href="/" className="mt-7 inline-flex rounded-full bg-nicolePink px-7 py-4 font-black text-white shadow-soft">Voltar ao início</Link>
      </div>
    </main>
  );
}
