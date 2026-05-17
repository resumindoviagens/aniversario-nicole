import Link from "next/link";
import Header from "@/components/Header";
import { Calendar, Clock, MapPin, Heart, Plane } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-3 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="ticket-card rounded-[34px] p-7 sm:p-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-nicoleBlue px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
            <Plane size={16} />
            NONO AIRLINES
          </div>

          <p className="mb-1 text-lg font-black text-nicolePink">
            Convite especial de embarque
          </p>

          <h1 className="script text-6xl font-black leading-none text-nicolePink sm:text-7xl">
            Nicole
          </h1>

          <div className="mt-3 inline-flex rounded-full bg-nicoleGold px-5 py-2 text-xl font-black text-nicoleBlue shadow-lg">
            8 ANOS
          </div>

          <p className="mt-6 text-xl font-black leading-snug text-nicoleBlue">
            Prepare as malas para uma festa cheia de diversão, carinho e aventura!
          </p>

          <div className="mt-7 space-y-4 text-base font-bold sm:text-lg">
            <div className="flex items-center gap-3">
              <Calendar className="shrink-0 text-nicolePink" />
              <span>07/06/2026 — Domingo</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="shrink-0 text-nicolePink" />
              <span>17:00 horas</span>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 shrink-0 text-nicolePink" />
              <span>
                Buffet Vila da Festa
                <br />
                <small className="font-semibold">
                  R. Dr. Jesuíno Maciel, 263 — Campo Belo, São Paulo - SP
                </small>
              </span>
            </div>
          </div>

          <div className="my-7 border-t border-dashed border-nicolePink"></div>

          <p className="mb-6 text-base font-bold text-nicoleBlue">
            <Heart className="mr-2 inline text-nicolePink" />
            Informe os nomes dos convidados e marque quem possui menos de 6 anos.
          </p>

          <Link href="/confirmar" className="btn-primary inline-flex w-full justify-center px-8 py-4 text-lg sm:w-auto">
            CONFIRMAR PRESENÇA ♥
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -left-4 -top-4 hidden rounded-full bg-white/90 px-5 py-3 text-sm font-black text-nicoleBlue shadow-xl sm:block">
            Embarque confirmado após preencher o formulário
          </div>

          <img
            src="/assets/nicole/hero-nicole-confirmacao.png"
            alt="Convite visual do aniversário da Nicole"
            className="w-full rounded-[34px] border border-white/80 bg-white object-cover shadow-2xl"
          />

          <div className="absolute -bottom-5 right-5 rounded-2xl bg-nicolePink px-5 py-3 text-sm font-black text-white shadow-xl">
            Festa da Nicole • 8 anos
          </div>
        </div>
      </section>
    </main>
  );
}
