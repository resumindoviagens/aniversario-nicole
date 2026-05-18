import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-8">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-white shadow-2xl">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="mb-5 inline-flex w-fit rounded-full bg-pink-600 px-5 py-2 text-sm font-black tracking-widest text-white">
              NONO AIRLINES
            </div>

            <p className="mb-2 text-lg font-bold text-pink-600">
              Convite especial de embarque
            </p>

            <h1 className="text-6xl font-black italic text-pink-600 sm:text-7xl">
              Nicole
            </h1>

            <div className="mt-4 inline-flex w-fit rounded-full bg-[#0d1b4c] px-5 py-3 text-2xl font-black text-white">
              8 ANOS
            </div>

            <p className="mt-8 text-xl font-bold leading-relaxed text-[#0d1b4c]">
              Prepare as malas para viver uma aventura incrível no aniversário da Nicole!
            </p>

            <div className="mt-8 space-y-4 text-lg font-bold text-[#0d1b4c]">
              <div>📅 07/06/2026 — Domingo</div>
              <div>⏰ 17:00 horas</div>
              <div>📍 Buffet Vila da Festa — Campo Belo/SP</div>
            </div>

            <Link
              href="/confirmar"
              className="mt-10 flex items-center justify-center rounded-[24px] bg-gradient-to-r from-pink-600 to-pink-500 px-8 py-6 text-center text-2xl font-black text-white shadow-2xl transition hover:scale-[1.02]"
            >
              CONFIRMAR MINHA PRESENÇA ♥
            </Link>
          </div>

          <div className="bg-[#ffe8f3] p-4">
            <img
              src="/assets/nicole/hero-nicole-confirmacao.png"
              className="h-full w-full rounded-[32px] object-cover"
              alt="Nicole"
            />
          </div>
        </div>
      </section>
    </main>
  );
}