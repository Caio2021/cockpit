export type StatusSaude = "green" | "yellow" | "red";

export interface ClienteSaudeBase {
  clienteId: number | null;
  nome: string;
  total: number;
  reportando: number; // status green
  parcial: number; // status yellow
  semPosicao: number; // status red
  dataReferencia: string;
}

export interface ResumoAlertas {
  total: number;
  novos: number;
  emTratamento: number;
  finalizados: number;
}

export interface AlertasPorDia {
  dia: string; // ISO date
  total: number;
}

export interface AlertasPorCliente {
  clienteId: number | null;
  nome: string;
  abertos: number;
}

export interface OrdemAberta {
  id: number;
  cliente: string | null;
  placa: string | null;
  tipo: string;
  status: string;
  diasAberta: number;
  eventDate: string | null;
}

export interface ResumoOrdens {
  abertas: number;
  fechadas30d: number;
  maisAntigaDias: number;
}

export interface ResumoObjetos {
  total: number;
  ativos: number;
  emRecuperacao: number;
  semDispositivo: number;
}

export interface ResultadoBusca {
  tipo: "objeto" | "cliente" | "ordem";
  id: number;
  titulo: string;
  subtitulo: string;
}

// O mesmo resultado, já com o link para a tela correspondente no SafeOn.
export interface ResultadoBuscaComLink extends ResultadoBusca {
  url: string;
}
