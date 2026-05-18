"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ChildGuest = {
  nome: string;
  menorSeis: boolean;
};

type AdultGuest = {
  nome: string;
};

export default function ConfirmarPage() {
  const router = useRouter();

  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [adults, setAdults] = useState<AdultGuest[]>([]);
  const [children, setChildren] = useState<ChildGuest[]>([{ nome: "", menorSeis: false }]);
  const [loading, setLoading] = useState(false);

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

  function addChild() {
    setChildren([...children, { nome: "", menorSeis: false }]);
  }

  function removeChild(index: number) {
    setChildren(children.filter((_, i) => i !== index));
  }

  function updateChildName(index: number, value: string) {
    const next = [...children];
    next[index].nome = value;
    setChildren(next);
  }

  function updateChildMenor(index: number, value: boolean) {
    const next = [...children];
    next[index].menorSeis = value;
    setChildren(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const cleanAdults = [
      { nome: responsavelNome.trim(), idade: 18, menor_seis: false },
      ...adults
        .map((a) => ({ nome: a.nome.trim(), idade: 18, menor_seis: false }))
        .filter((a) => a.nome),
    ].filter((a) => a.nome);

    const cleanChildren = children
      .map((c) => ({
        nome: c.nome.trim(),
        idade: c.menorSeis ? 5 : 6,
        menor_seis: c.menorSeis,
      }))
      .filter((c) => c.nome);

    const allGuests = [...cleanAdults, ...cleanChildren];

    if (!responsavelNome.trim() || !responsavelTelefone.trim()) {
      alert("Informe o nome e WhatsApp do responsável.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("confirmations")
      .insert({
        responsavel_nome: responsavelNome,
        responsavel_telefone: responsavelTelefone,
        responsavel_email: responsavelEmail || null,
        observacoes,
        quantidade_convidados: allGuests.length,
      })
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar confirmação: " + error.message);
      setLoading(false);
      return;
    }

    const rows = allGuests.map((guest) => ({
      ...guest,
      confirmation_id: data.id,
    }));

    const { error: guestsError } = await supabase.from("guests").insert(rows);

    if (guestsError) {
      alert("Confirmação salva, mas houve erro nos convidados: " + guestsError.message);
      setLoading(false);
      return;
    }

    try {
      const emailResponse = await fetch("/api/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsavelNome,
          responsavelTelefone,
          responsavelEmail,
          convidados: allGuests,
        }),
      });

      const emailResult = await emailResponse.json().catch(() => null);
      if (!emailResponse.ok) {
        console.error("Erro no envio do email:", emailResult);
      }
    } catch (err) {
      console.error("Falha ao chamar rota de email:", err);
    }

    router.push("/sucesso");
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] px-4 py-10">
      <section className="mx-auto max-w-5xl rounded-[40px] bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full bg-pink-600 px-5 py-2 text-sm font-black tracking-widest text-white">
            CONFIRMAÇÃO DE EMBARQUE
          </div>

          <h1 className="text-5xl font-black italic text-pink-600">
            Confirmar presença
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg font-bold leading-relaxed text-[#0d1b4c]">
            Informe o adulto responsável, os acompanhantes e as crianças.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-[30px] bg-[#fff8fc] p-6 shadow-sm">
            <h2 className="mb-5 text-3xl font-black text-[#0d1b4c]">
              Adulto responsável principal
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                required
                value={responsavelNome}
                onChange={(e) => setResponsavelNome(e.target.value)}
                className="h-16 rounded-2xl border-2 border-pink-100 px-5 text-lg outline-none focus:border-pink-600"
                placeholder="Nome completo"
              />

              <input
                required
                value={responsavelTelefone}
                onChange={(e) => setResponsavelTelefone(e.target.value)}
                className="h-16 rounded-2xl border-2 border-pink-100 px-5 text-lg outline-none focus:border-pink-600"
                placeholder="WhatsApp"
              />
            </div>

            <input
              type="email"
              value={responsavelEmail}
              onChange={(e) => setResponsavelEmail(e.target.value)}
              className="mt-5 h-16 w-full rounded-2xl border-2 border-pink-100 px-5 text-lg outline-none focus:border-pink-600"
              placeholder="E-mail (opcional)"
            />

            <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-[#0d1b4c]/80">
              O responsável principal já será contado como adulto confirmado.
            </p>
          </div>

          <div className="rounded-[30px] bg-[#fff8fc] p-6 shadow-sm">
            <h2 className="mb-5 text-3xl font-black text-[#0d1b4c]">
              Outros adultos acompanhantes
            </h2>

            <div className="space-y-4">
              {adults.map((adult, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1fr_120px]">
                  <input
                    value={adult.nome}
                    onChange={(e) => updateAdult(index, e.target.value)}
                    className="h-16 rounded-2xl border-2 border-pink-100 px-5 text-lg outline-none focus:border-pink-600"
                    placeholder="Nome completo do adulto"
                  />

                  <button
                    type="button"
                    onClick={() => removeAdult(index)}
                    className="rounded-2xl border-2 border-pink-200 px-5 py-4 font-black text-pink-600"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAdult}
              className="mt-5 rounded-2xl border-2 border-pink-600 px-6 py-4 text-lg font-black text-pink-600"
            >
              + adicionar adulto
            </button>
          </div>

          <div className="rounded-[30px] bg-[#fff8fc] p-6 shadow-sm">
            <h2 className="mb-5 text-3xl font-black text-[#0d1b4c]">
              Crianças
            </h2>

            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="rounded-3xl border-2 border-pink-100 bg-white p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_260px_120px]">
                    <input
                      value={child.nome}
                      onChange={(e) => updateChildName(index, e.target.value)}
                      className="h-16 rounded-2xl border-2 border-pink-100 px-5 text-lg outline-none focus:border-pink-600"
                      placeholder="Nome completo da criança"
                    />

                    <label className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-pink-50 text-lg font-black text-[#0d1b4c]">
                      <input
                        type="checkbox"
                        checked={child.menorSeis}
                        onChange={(e) => updateChildMenor(index, e.target.checked)}
                        className="h-6 w-6 accent-pink-600"
                      />
                      abaixo de 6 anos
                    </label>

                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="rounded-2xl border-2 border-pink-200 px-5 py-4 font-black text-pink-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addChild}
              className="mt-5 rounded-2xl border-2 border-pink-600 px-6 py-4 text-lg font-black text-pink-600"
            >
              + adicionar criança
            </button>
          </div>

          <div className="rounded-[30px] bg-[#fff8fc] p-6 shadow-sm">
            <h2 className="mb-5 text-3xl font-black text-[#0d1b4c]">
              Observações
            </h2>

            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="min-h-[150px] w-full rounded-2xl border-2 border-pink-100 p-5 text-lg outline-none focus:border-pink-600"
              placeholder="Alergias, observações ou recados."
            />
          </div>

          <div className="sticky bottom-4 z-20 rounded-[32px] bg-white/95 p-3 shadow-2xl backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
            <button
              disabled={loading}
              className="w-full rounded-[32px] bg-gradient-to-r from-pink-700 via-pink-600 to-pink-500 px-8 py-8 text-2xl font-black uppercase tracking-wide text-white shadow-[0_18px_45px_rgba(233,30,99,0.38)] transition hover:scale-[1.01] active:scale-[0.99] sm:py-9 sm:text-3xl"
            >
              {loading ? "ENVIANDO CONFIRMAÇÃO..." : "ENVIAR CONFIRMAÇÃO ♥"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}