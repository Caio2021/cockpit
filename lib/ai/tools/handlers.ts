import {
  buscaGlobal,
  getAlertasPorDia,
  getOrdensAbertas,
  getResumoAlertas,
  getResumoObjetos,
  getResumoOrdens,
} from "@/lib/safeon/queries";
import { getRankingClientes } from "@/lib/safeon/risco";
import { consultarBase, descreverTabela, listarTabelas } from "@/lib/safeon/schema";

export interface ToolHandlerResult {
  output: unknown;
  isError?: boolean;
}

// Mapeia nome+input de tool (decididos pela LLM) para as consultas do banco do
// SafeOn. Nunca recalcula nada aqui — o score de risco vem de lib/safeon/risco
// e o resto é SQL. Erros de negócio viram { isError: true }, nunca exceção.
export async function executeTool(
  name: string,
  input: Record<string, unknown>,
): Promise<ToolHandlerResult> {
  switch (name) {
    case "getResumoOperacao": {
      const [objetos, alertas, ordens] = await Promise.all([
        getResumoObjetos(),
        getResumoAlertas(),
        getResumoOrdens(),
      ]);
      return { output: { objetos, alertas, ordens } };
    }

    case "getRankingClientesRisco":
      return { output: { clientes: await getRankingClientes() } };

    case "getAlertasPorDia": {
      const dias = typeof input.dias === "number" ? input.dias : 7;
      return { output: { dias, series: await getAlertasPorDia(dias) } };
    }

    case "getOrdensAbertas": {
      const limite = typeof input.limite === "number" ? input.limite : 20;
      // O total vai junto porque a lista é uma amostra das mais antigas: sem
      // ele a LLM lê o tamanho do array como se fosse o total de ordens.
      const [resumo, ordens] = await Promise.all([getResumoOrdens(), getOrdensAbertas(limite)]);
      return {
        output: {
          totalAbertas: resumo.abertas,
          mostrandoAsMaisAntigas: ordens.length,
          ordens,
        },
      };
    }

    case "buscarNaBase": {
      const termo = String(input.termo ?? "").trim();
      if (termo.length < 2) {
        return { isError: true, output: { erro: "Informe ao menos 2 caracteres para buscar." } };
      }
      const resultados = await buscaGlobal(termo);
      if (resultados.length === 0) {
        return { isError: true, output: { erro: `Nada encontrado para "${termo}".` } };
      }
      return { output: { resultados } };
    }

    case "listarTabelas":
      return { output: { tabelas: await listarTabelas() } };

    case "descreverTabela": {
      const tabela = String(input.tabela ?? "").trim();
      const colunas = await descreverTabela(tabela);
      if (colunas.length === 0) {
        return {
          isError: true,
          output: { erro: `Tabela "${tabela}" não existe. Use listarTabelas para ver as disponíveis.` },
        };
      }
      return { output: { tabela, colunas } };
    }

    case "consultarBase": {
      const sql = String(input.sql ?? "");
      const limite = typeof input.limite === "number" ? input.limite : undefined;
      try {
        return { output: await consultarBase(sql, limite) };
      } catch (erro) {
        // O erro do Postgres (coluna inexistente, sintaxe) volta como resultado
        // de ferramenta para a LLM corrigir a consulta, não como exceção.
        return {
          isError: true,
          output: { erro: erro instanceof Error ? erro.message : "Falha ao consultar a base." },
        };
      }
    }

    default:
      return { isError: true, output: { erro: `Ferramenta desconhecida: ${name}` } };
  }
}
