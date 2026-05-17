import Image from 'next/image';

export function NicoleHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nicoleBlue text-xl font-black text-white shadow-soft">N</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-nicolePink">NONO Airlines</p>
          <h1 className="text-lg font-black text-nicoleBlue">Aniversário da Nicole</h1>
        </div>
      </div>
      <a href="#confirmar" className="rounded-full bg-nicolePink px-5 py-3 text-sm font-black text-white shadow-soft transition hover:scale-105">Confirmar presença</a>
    </header>
  );
}
