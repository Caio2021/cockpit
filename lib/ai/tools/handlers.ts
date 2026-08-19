import {
  getEmpreendimentoById,
  getEmpreendimentoByNome,
  getEmpreendimentos,
} from "@/lib/data/repository";
import { getRankingRisco, getRankingRiscoFinanceiro } from "@/lib/risk/ranking";
import { calcularRiscoAtraso } from "@/lib/risk/calcularRiscoAtraso";
import { calcularRiscoFinanceiro } from "@/lib/risk/calcularRiscoFinanceiro";
import { diasAte } from "@/lib/risk/util";
import { simularAtraso } from "@/lib/simulation/simularAtraso";

export interface ToolHandlerResult {
  output: unknown;
  isError?: boolean;
}

function resolveEmpreendimento(identificador: string) {
  return (
    getEmpreendimentoById(identificador) ?? getEmpreendimentoByNome(identificador)
  );
}

function erroEmpreendimentoNaoEncontrado(identificador: string): ToolHandlerResult {
  return {
    isError: true,
    output: {
      erro: `Nenhum empreendimento encontrado para "${identificador}".`,
      empreendimentosDisponiveis: getEmpreendimentos().map((e) => e.nome),
    },
  };
}

// Mapeia nome+input de tool (decididos pela LLM) para as funções puras já
// existentes em lib/data, lib/risk e lib/simulation. Nunca recalcula nada —
// só resolve o identificador e delega. Erros de negócio (ex.: empreendimento
// inexistente) viram { isError: true }, nunca uma exceção lançada.
export function executeTool(
  name: string,
  input: Record<string, unknown>,
): ToolHandlerResult {
  switch (name) {
    case "getRiskRanking":
      return { output: getRankingRisco() };

    case "getRiskFinanceiroRanking":
      return { output: getRankingRiscoFinanceiro() };

    case "getEmpreendimentoDetalhe": {
      const identificador = String(input.identificador ?? "");
      const emp = resolveEmpreendimento(identificador);
      if (!emp) return erroEmpreendimentoNaoEncontrado(identificador);
      return {
        output: {
          empreendimento: emp,
          riscoAtraso: calcularRiscoAtraso(emp),
          riscoFinanceiro: calcularRiscoFinanceiro(emp),
        },
      };
    }

    case "getFornecedoresProblematicos": {
      const identificador = input.identificador
        ? String(input.identificador)
        : undefined;
      const alvo = identificador ? resolveEmpreendimento(identificador) : undefined;
      if (identificador && !alvo) return erroEmpreendimentoNaoEncontrado(identificador);

      const base = alvo ? [alvo] : getEmpreendimentos();
      const fornecedores = base
        .flatMap((e) =>
          e.fornecedoresCriticos.map((f) => ({ empreendimentoNome: e.nome, ...f })),
        )
        .sort((a, b) => b.diasAtrasoHistorico - a.diasAtrasoHistorico);
      return { output: { fornecedores } };
    }

    case "getContratosParaReajuste": {
      const janelaDias =
        typeof input.janelaDias === "number" ? input.janelaDias : 120;
      const contratos = getEmpreendimentos()
        .flatMap((e) =>
          e.contratos.map((c) => ({
            empreendimentoNome: e.nome,
            ...c,
            diasAteReajuste: diasAte(c.dataProximoReajuste),
          })),
        )
        .filter((c) => c.diasAteReajuste <= janelaDias)
        .sort((a, b) => a.diasAteReajuste - b.diasAteReajuste);
      return { output: { janelaDias, contratos } };
    }

    case "simularAtrasoNoCaixa": {
      const identificador = String(input.identificador ?? "");
      const diasAtraso = Number(input.diasAtraso);
      const emp = resolveEmpreendimento(identificador);
      if (!emp) return erroEmpreendimentoNaoEncontrado(identificador);
      if (!Number.isFinite(diasAtraso) || diasAtraso < 0) {
        return {
          isError: true,
          output: { erro: `diasAtraso inválido: "${String(input.diasAtraso)}".` },
        };
      }
      return { output: simularAtraso(emp.id, diasAtraso) };
    }

    default:
      return { isError: true, output: { erro: `Ferramenta desconhecida: ${name}` } };
  }
}
