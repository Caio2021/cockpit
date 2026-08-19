import { empreendimentos } from "./fixtures/empreendimentos";
import type { Empreendimento } from "./types";

// Funções puras e síncronas de leitura — sem I/O, sem cache, sem banco.
// Única fonte de verdade lida tanto pelo painel de KPIs quanto pelas tools de IA.

export function getEmpreendimentos(): Empreendimento[] {
  return empreendimentos;
}

export function getEmpreendimentoById(id: string): Empreendimento | undefined {
  return empreendimentos.find((e) => e.id === id);
}

export function getEmpreendimentoByNome(
  nomeParcial: string,
): Empreendimento | undefined {
  const alvo = nomeParcial.trim().toLowerCase();
  return empreendimentos.find((e) => e.nome.toLowerCase().includes(alvo));
}
