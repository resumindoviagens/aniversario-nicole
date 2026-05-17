import Image from 'next/image';
import { NicoleHeader } from '@/components/NicoleHeader';
import { FloatingDecor } from '@/components/FloatingDecor';
import { EventCard } from '@/components/EventCard';
import { ConfirmationForm } from '@/components/ConfirmationForm';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <FloatingDecor />
      <NicoleHeader />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-black text-nicolePink shadow-soft">✈️ Embarque confirmado para uma grande aventura</div>
          <h1 className="mt-6 text-5xl font-black leading-tight text-nicoleBlue md:text-7xl">Nicole faz <span className="text-nicolePink">8 anos</span>!</h1>
          <p className="mt-5 max-w-xl text-xl font-semibold text-nicoleBlue/75">Prepare as malas para uma festa cheia de diversão, carinho e muita alegria. Faça seu check-in online e confirme sua presença.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#confirmar" className="rounded-full bg-nicolePink px-7 py-4 text-lg font-black text-white shadow-soft">Confirmar presença</a>
            <a href="/admin" className="rounded-full bg-white px-7 py-4 text-lg font-black text-nicoleBlue shadow-soft">Área dos pais</a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-nicoleRose via-white to-blue-100 blur-xl" />
          <div className="relative rounded-[3rem] bg-white p-4 shadow-soft">
            <Image src="/assets/nicole/layout-geral-site.png" alt="Layout visual do aniversário da Nicole" width={1200} height={800} className="rounded-[2.4rem] object-cover" priority />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <EventCard />
      </section>
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <ConfirmationForm />
      </section>
    </main>
  );
}
