"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Baby, Users } from "lucide-react";

type Child = { nome: string; menorSeis: boolean };
type Adult = { nome: string };

export default function ConfirmarPage() {
  const router = useRouter();
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [children, setChildren] = useState<Child[]>([{ nome: "", menorSeis: false }]);
  const [adults, setAdults] = useState<Adult[]>([{ nome: "" }]);
  const [loading, setLoading] = useState(false);

  function addChild() {
    setChildren([...children, { nome: "", menorSeis: false }]);
  }

  function removeChild(index: number) {
    setChildren(children.filter((_, i) => i !== index));
  }

  function updateChild(index: number, field: keyof Child, value: string | boolean) {
    const next = [...children];
    (next[index] as any)[field] = value;
    setChildren(next);
  }

  function addAdult() {
    setAdults([...adults, { nome: "" }]);
  }

  function removeAdult(index: number) {
    setAdults(adults.filter((_, i) => i !== index));
  }

  function updateAdult(index: number, value: string) {
    const next = [...adults];
    next[index].nome = value;
    setAdults(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const cleanChildren = children
      .map(c => ({
        nome: c.nome.trim(),
        idade: c.menorSeis ? 5 : 6,
        menor_seis: c.menorSeis
      }))
      .filter(c => c.nome);

    const cleanAdults = adults
      .map(a => ({
        nome: a.nome.trim(),
        idade: 18,
        menor_seis: false
      }))
      .filter(a => a.nome);

    const allGuests = [...cleanChildren, ...cleanAdults];

    if (!allGuests.length) {
      alert("Informe pelo menos uma criança ou adulto.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("confirmations")
      .insert({
        responsavel_nome: responsavelNome,
        responsavel_telefone: responsavelTelefone,
        observacoes,
        quantidade_convidados: allGuests.length
      })
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar confirmação: " + error.message);
      setLoading(false);
      return;
    }

    const rows = allGuests.map(g => ({ ...g, confirmation_id: data.id }));
    const { error: guestsError } = await supabase.from("guests").insert(rows);

    if (guestsError) {
      alert("Confirmação salva, mas houve erro nos convidados: " + guestsError.message);
      setLoading(false);
      return;
    }

    router.push("/sucesso");
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-5xl px-5 pb-20 pt-3">
        <form onSubmit={handleSubmit} className="ticket-card rounded-[36px] p-6 sm:p-10">
          <div className="mb-9 text-center">
            <p className="mb-2 font-black uppercase tracking-[0.25em] text-nicolePink">NONO AIRLINES</p>
            <h1 className="script text-5xl font-black leading-none text-nicolePink sm:text-6xl">
              Confirmar presença
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-relaxed text-nicoleBlue">
              Para organizar a festa com carinho, informe o responsável, as crianças, os adultos e marque quais crianças têm menos de 6 anos.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/80 p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 text-2xl font-black text-nicoleBlue">Dados do responsável</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-base font-black text-nicoleBlue">
                Nome do responsável
                <input
                  required
                  value={responsavelNome}
                  onChange={e => setResponsavelNome(e.target.value)}
                  className="mt-3 h-14 w-full rounded-2xl border-2 border-pink-100 bg-white px-4 text-lg outline-none focus:border-nicolePink"
                  placeholder="Nome completo"
                />
              </label>

              <label className="block text-base font-black text-nicoleBlue">
                WhatsApp
                <input
                  required
                  value={responsavelTelefone}
                  onChange={e => setResponsavelTelefone(e.target.value)}
                  className="mt-3 h-14 w-full rounded-2xl border-2 border-pink-100 bg-white px-4 text-lg outline-none focus:border-nicolePink"
                  placeholder="(11) 99999-9999"
                />
              </label>
            </div>
          </div>

          <div className="my-8 border-t border-dashed border-nicolePink"></div>

          <section className="rounded-[28px] bg-white/80 p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <Baby className="text-nicolePink" size={30} />
              <div>
                <h2 className="text-2xl font-black text-nicoleBlue">Nome da(s) criança(s)</h2>
                <p className="font-bold text-nicoleBlue/80">Marque o checklist ao lado se a criança tiver menos de 6 anos.</p>
              </div>
            </div>

            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="grid gap-3 rounded-3xl border-2 border-pink-100 bg-white p-4 md:grid-cols-[1fr_210px_52px] md:items-center">
                  <input
                    placeholder="Nome completo da criança"
                    value={child.nome}
                    onChange={e => updateChild(index, "nome", e.target.value)}
                    className="h-14 rounded-2xl border-2 border-pink-100 px-4 text-lg outline-none focus:border-nicolePink"
                  />

                  <label className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-nicoleSoft px-4 text-base font-black text-nicoleBlue">
                    <input
                      type="checkbox"
                      checked={child.menorSeis}
                      onChange={e => updateChild(index, "menorSeis", e.target.checked)}
                      className="h-6 w-6 accent-nicolePink"
                    />
                    abaixo de 6 anos
                  </label>

                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    className="flex h-14 items-center justify-center rounded-2xl border-2 border-pink-100 text-nicolePink"
                    aria-label="Remover criança"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addChild} className="mt-5 inline-flex items-center gap-2 rounded-2xl border-2 border-nicolePink px-5 py-4 font-black text-nicolePink">
              <Plus size={20} /> Adicionar criança
            </button>
          </section>

          <section className="mt-8 rounded-[28px] bg-white/80 p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <Users className="text-nicolePink" size={30} />
              <div>
                <h2 className="text-2xl font-black text-nicoleBlue">Nome do(s) adulto(s)</h2>
                <p className="font-bold text-nicoleBlue/80">Informe os adultos que irão acompanhar.</p>
              </div>
            </div>

            <div className="space-y-4">
              {adults.map((adult, index) => (
                <div key={index} className="grid gap-3 rounded-3xl border-2 border-pink-100 bg-white p-4 md:grid-cols-[1fr_52px] md:items-center">
                  <input
                    placeholder="Nome completo do adulto"
                    value={adult.nome}
                    onChange={e => updateAdult(index, e.target.value)}
                    className="h-14 rounded-2xl border-2 border-pink-100 px-4 text-lg outline-none focus:border-nicolePink"
                  />

                  <button
                    type="button"
                    onClick={() => removeAdult(index)}
                    className="flex h-14 items-center justify-center rounded-2xl border-2 border-pink-100 text-nicolePink"
                    aria-label="Remover adulto"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addAdult} className="mt-5 inline-flex items-center gap-2 rounded-2xl border-2 border-nicolePink px-5 py-4 font-black text-nicolePink">
              <Plus size={20} /> Adicionar adulto
            </button>
          </section>

          <label className="mt-8 block rounded-[28px] bg-white/80 p-5 text-base font-black text-nicoleBlue shadow-sm sm:p-7">
            Observações
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="mt-3 min-h-32 w-full rounded-2xl border-2 border-pink-100 bg-white p-4 text-lg outline-none focus:border-nicolePink"
              placeholder="Alergias, observações ou recados."
            />
          </label>

          <button disabled={loading} className="btn-primary mt-9 w-full rounded-[24px] px-8 py-6 text-xl font-black uppercase tracking-wide sm:text-2xl">
            {loading ? "Enviando..." : "ENVIAR CONFIRMAÇÃO ♥"}
          </button>
        </form>
      </section>
    </main>
  );
}
