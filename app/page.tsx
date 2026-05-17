import Link from "next/link";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, Heart, Plane } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="ticket-card rounded-[36px] p-7 sm:p-10 lg:p-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-nicoleBlue px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-white">
            <Plane size={16} />
            NONO AIRLINES
          </div>

          <p className="mb-2 text-lg font-black text-nicolePink sm:text-xl">
            Convite especial de embarque
          </p>

          <h1 className="script text-6xl font-black leading-none text-nicolePink sm:text-7xl lg:text-8xl">
            Nicole
          </h1>

          <div className="mt-4 inline-flex rounded-full bg-nicoleGold px-6 py-3 text-2xl font-black text-nicoleBlue shadow-lg">
            8 ANOS
          </div>

          <p className="mt-8 max-w-xl text-xl font-black leading-snug text-nicoleBlue sm:text-2xl">
            Prepare as malas para uma festa cheia de diversão, carinho e aventura!
          </p>

          <div className="mt-8 space-y-5 text-lg font-bold sm:text-xl">
            <div className="flex items-center gap-4">
              <Calendar className="shrink-0 text-nicolePink" size={28} />
              <span>07/06/2026 — Domingo</span>
            </div>

            <div className="flex items-center gap-4">
              <Clock className="shrink-0 text-nicolePink" size={28} />
              <span>17:00 horas</span>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="mt-1 shrink-0 text-nicolePink" size={28} />
              <span>
                Buffet Vila da Festa
                <br />
                <small className="font-semibold">
                  R. Dr. Jesuíno Maciel, 263 — Campo Belo, São Paulo - SP
                </small>
              </span>
            </div>
          </div>

          <div className="my-8 border-t border-dashed border-nicolePink"></div>

          <p className="mb-7 text-lg font-bold text-nicoleBlue">
            <Heart className="mr-2 inline text-nicolePink" />
            Informe os nomes das crianças, dos adultos e marque crianças abaixo de 6 anos.
          </p>

          <Link
            href="/confirmar"
            className="btn-primary flex w-full items-center justify-center rounded-[22px] px-8 py-6 text-center text-xl font-black uppercase tracking-wide sm:text-2xl"
          >
            CONFIRMAR MINHA PRESENÇA ♥
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -left-4 -top-4 hidden rounded-full bg-white/95 px-6 py-4 text-base font-black text-nicoleBlue shadow-xl sm:block">
            Embarque confirmado após preencher o formulário
          </div>

          <img
            src="/assets/nicole/hero-nicole-confirmacao.png"
            alt="Convite visual do aniversário da Nicole"
            className="w-full rounded-[36px] border border-white/80 bg-white object-cover shadow-2xl"
          />

          <Link
            href="/confirmar"
            className="btn-primary mt-7 flex w-full items-center justify-center rounded-[22px] px-8 py-5 text-center text-xl font-black uppercase tracking-wide lg:hidden"
          >
            CONFIRMAR PRESENÇA ♥
          </Link>

          <div className="absolute -bottom-5 right-5 hidden rounded-2xl bg-nicolePink px-5 py-3 text-sm font-black text-white shadow-xl sm:block">
            Festa da Nicole • 8 anos
          </div>
        </div>
      </section>
    </main>
  );
}
