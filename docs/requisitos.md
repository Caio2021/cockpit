# Requisitos — Cockpit Inteligente de Gestão de Empreendimentos

Documento produzido pelo Analista de Requisitos para orientar o Arquiteto e os
desenvolvedores na construção de um **protótipo real** (não apenas slides) a ser
apresentado em até 15 minutos numa entrevista técnica. Prazo de construção: ~48h.

## 1. Objetivo do MVP

Demonstrar, com um protótipo funcional, um "Cockpit Executivo" que responde em
linguagem natural (pt-BR) perguntas de diretoria sobre risco de atraso, estouro
de orçamento, fornecedores problemáticos, contratos e risco financeiro,
**citando os indicadores que sustentam cada conclusão** e permitindo simulações
simples de impacto (ex.: atraso de 30 dias no cronograma → impacto no fluxo de caixa).

O protótipo deve ser pequeno, estável e fácil de narrar em 15 minutos — não um
sistema enterprise. Prioriza-se profundidade em um recorte pequeno (uma cadeia de
perguntas encadeadas, como no exemplo do case) sobre cobertura ampla de todas as
fontes de dados citadas no case.

## 2. Escopo

**Dentro do escopo (MVP):**
- Chat em linguagem natural (pt-BR) sobre um conjunto de dados mockados que
  representa, de forma unificada, os dados de várias fontes citadas no case
  (ERP, CRM, BI, Planejamento, Compras, Financeiro, Engenharia, Diário de Obras).
- Respostas com explicação do raciocínio e citação dos indicadores usados.
- Geração de plano de ação (texto estruturado) para o empreendimento de maior risco.
- Simulação determinística de atraso de N dias e seu impacto no fluxo de caixa.
- Painel visual simples (cards/KPIs) ao lado do chat, mostrando o ranking de
  risco dos empreendimentos — reforça a leitura de "cockpit", não só chatbot.
- Uso de LLM real (Claude, via API Anthropic) chamada apenas no backend (API
  routes do Next.js).

**Fora do escopo (mencionar apenas como roadmap/arquitetura na apresentação, não implementar):**
- Integrações reais com ERP/CRM/BI/SharePoint/sistema de chamados.
- Autenticação, autorização, multiusuário, perfis de acesso.
- Orquestração multiagente real (pode ser citada como evolução arquitetural).
- Persistência em banco de dados real, pipelines de ingestão, histórico versionado.
- Suporte a múltiplos idiomas, múltiplas sessões persistidas, mobile.

## 3. Requisitos Funcionais (priorizados)

### P0 — obrigatórios para a demo ao vivo
| ID | Requisito |
|---|---|
| RF01 | O sistema deve expor um chat em português onde o usuário digita perguntas em linguagem natural e recebe respostas em texto. |
| RF02 | O sistema deve manter um conjunto de dados mockados de 6 a 8 empreendimentos, cobrindo: cronograma (% de atraso), orçamento (previsto x realizado), fornecedores críticos e seu histórico de atraso, contratos (data de reajuste, índice), e fluxo de caixa projetado. |
| RF03 | Responder "Qual empreendimento apresenta maior risco?" identificando o empreendimento e uma classificação de risco (ex.: alto/médio/baixo). |
| RF04 | Ao ser questionado "Explique o motivo" / "Quais indicadores sustentam essa conclusão?", o sistema deve listar explicitamente os indicadores de dados (não apenas prosa genérica) que embasaram a resposta anterior. |
| RF05 | Gerar um plano de ação estruturado (lista de passos) para mitigar o risco do empreendimento identificado, quando solicitado ("Gere um plano de ação"). |
| RF06 | Simular impacto de um atraso de N dias (parametrizável, ex. 30) no fluxo de caixa do empreendimento, retornando um valor quantificado (ex.: R$ ou % de impacto) e uma explicação em linguagem natural do cálculo. |
| RF07 | Exibir um painel visual (fora do chat) com ranking dos empreendimentos por risco e seus principais KPIs, atualizado com os mesmos dados mockados. |

### P1 — reforçam diferenciais, incluir se sobrar tempo
| ID | Requisito |
|---|---|
| RF08 | Responder "Quais fornecedores estão impactando os cronogramas?" |
| RF09 | Responder "Quais contratos precisam de reajuste?" |
| RF10 | Responder "Quais empreendimentos terão estouro de orçamento?" |
| RF11 | Responder "Qual empreendimento possui maior risco financeiro?" (separado do risco de atraso) |
| RF12 | Manter contexto conversacional dentro da sessão (perguntas de acompanhamento referenciam a resposta anterior). |

### P2 — fora do protótipo, citar apenas na apresentação
| ID | Requisito |
|---|---|
| RF13 | Integração real com sistemas de origem (ERP/CRM/BI/SharePoint/chamados). |
| RF14 | Múltiplos agentes especializados por domínio de dado (orquestração multiagente). |
| RF15 | Persistência de histórico de conversas e auditoria de longo prazo. |

## 4. Requisitos Não Funcionais

| ID | Requisito | Observação |
|---|---|---|
| RNF01 | Idioma: toda a interação (perguntas e respostas) deve funcionar em português (pt-BR). | O case é em português; falhar nisso é falha de demo. |
| RNF02 | Tempo de resposta perceptível em demo ao vivo: exibir estado de "carregando" imediatamente e resposta completa idealmente em até 8s. | Depende de latência da API Anthropic; sem streaming é aceitável, mas o loading state é obrigatório para não parecer travado. |
| RNF03 | Explicabilidade/auditabilidade: toda resposta que envolve uma conclusão de risco deve ser rastreável aos campos de dados mockados usados (não pode ser uma alegação da LLM sem lastro nos dados). | Atende diretamente à exigência do case ("explique o motivo", "quais indicadores sustentam"). |
| RNF04 | Determinismo dos cálculos quantitativos: simulações (ex. impacto de atraso no caixa) devem ser calculadas por código determinístico, e a LLM apenas narra o resultado — a LLM não deve "inventar" o número. | Evita números inconsistentes entre execuções ao vivo durante a entrevista. |
| RNF05 | Resiliência mínima: se a chamada à API Anthropic falhar ou expirar, exibir mensagem de erro amigável em vez de travar a tela. | Risco alto em demo ao vivo com internet/API externa. |
| RNF06 | Simplicidade operacional: o protótipo deve rodar localmente com um único comando (`npm run dev`), sem infraestrutura externa além da API Anthropic. | Alinhado ao pedido de solução simples e fácil de apresentar. |
| RNF07 | Segurança de dados sensíveis e configuração — ver seção 8 (REGRAS_SEGURANCA.md). | Obrigatório por regra do repositório. |

## 5. Perguntas âncora (o protótipo precisa responder bem)

Extraídas literalmente do case — são o roteiro mínimo de demonstração:

1. Qual obra está com maior risco de atraso?
2. Quais empreendimentos terão estouro de orçamento?
3. Quais fornecedores estão impactando os cronogramas?
4. Quais contratos precisam de reajuste?
5. Qual empreendimento possui maior risco financeiro?
6. Qual empreendimento apresenta maior risco? Explique o motivo.
7. Quais indicadores sustentam essa conclusão?
8. Gere um plano de ação.
9. Simule um atraso de 30 dias. Quanto isso impacta o fluxo de caixa?

A sequência 6→7→8→9 é a cadeia narrativa que o próprio case usa como exemplo de
interação — deve ser o "fio condutor" da demo de 15 min (mapeada em RF03–RF06,
P0). As perguntas 2–5 (RF08–RF11) reforçam amplitude e podem ser P1 se o tempo
de desenvolvimento apertar.

**Perguntas adicionais sugeridas (reforçam diferenciais sem expandir escopo de dado):**
- "Quais empreendimentos precisam de atenção imediata esta semana?" — reforça o
  ângulo de *monitoramento proativo*, não só resposta reativa.
- "Compare o risco do Empreendimento A com o Empreendimento B." — mostra que o
  sistema raciocina sobre o conjunto de dados, não apenas recupera um registro.
- "Se o atraso fosse de 60 dias em vez de 30, o impacto no caixa muda
  proporcionalmente?" — evidencia que a simulação é um cálculo real (RNF04),
  não uma resposta genérica da LLM.

## 6. Critérios de aceite (objetivos e testáveis)

- [ ] AC1: Ao perguntar "Qual empreendimento apresenta maior risco?", o sistema
      responde citando o nome do empreendimento e ao menos 3 indicadores
      concretos (ex.: "atraso de X% no cronograma", "estouro de Y% no
      orçamento", "fornecedor Z com histórico de atraso") em até 10s.
- [ ] AC2: Ao perguntar em seguida "Explique o motivo" ou "Quais indicadores
      sustentam essa conclusão?", a resposta reaproveita o mesmo empreendimento
      da resposta anterior (contexto mantido) e detalha os indicadores.
- [ ] AC3: Ao pedir "Gere um plano de ação", o sistema retorna uma lista de
      ações (mínimo 3 itens) coerente com os indicadores citados anteriormente.
- [ ] AC4: Ao pedir para simular um atraso de 30 dias, o sistema retorna um
      valor numérico de impacto no fluxo de caixa (não apenas texto vago) e
      esse valor é reproduzível (mesma entrada → mesmo resultado).
- [ ] AC5: Cada uma das 5 perguntas-âncora originais do case (itens 1–5 da
      seção 5) recebe resposta relevante e não genérica ("não sei" só é
      aceitável se o dado mockado realmente não cobrir o caso).
- [ ] AC6: O painel visual mostra, sem precisar perguntar, o ranking de
      empreendimentos por risco assim que a tela carrega.
- [ ] AC7: Se a API Anthropic falhar (ex.: chave inválida/timeout simulado), a
      tela exibe mensagem de erro legível, sem quebrar a aplicação.
- [ ] AC8: `ANTHROPIC_API_KEY` está presente (vazia) em `.env.exemplo`, é lida
      apenas via variável de ambiente no backend, e uma busca por essa chave
      no código-fonte não retorna nenhum valor real hardcoded.
- [ ] AC9: Todos os dados usados (empreendimentos, fornecedores, contratos)
      são claramente fictícios/sintéticos — nenhum nome de empresa, obra ou
      pessoa real.

## 7. Lacunas e ambiguidades do case (assumidas, não bloqueantes)

O case não define alguns pontos com precisão. Para não travar o desenvolvimento
em 48h, seguem suposições assumidas — valem a pena ser mencionadas/confirmadas
na entrevista, mas não impedem o trabalho:

- **Como "risco" é calculado?** O case não dá fórmula. Suposição: risco de
  atraso = função de (% de atividades atrasadas + criticidade dos fornecedores
  atrasados); risco financeiro = função de (% de estouro de orçamento +
  exposição a contratos com reajuste pendente). Fórmula simples e explicável,
  documentada no código, para poder ser justificada ao vivo.
- **Quantos empreendimentos mockar?** Suposição: 6 a 8 — suficiente para
  mostrar variedade (diferentes níveis de risco) sem poluir a demo.
- **O case menciona "IA e agentes" — exige multiagentes no protótipo?**
  Suposição: não. Para o MVP, uma única chamada à LLM com acesso estruturado
  aos dados mockados (via function calling/tool use) é suficiente. Arquitetura
  multiagente pode ser apresentada como evolução natural nos slides, sem ser
  implementada agora.
- **Precisa de banco de dados real?** Suposição: não — dados mockados como
  fixtures (JSON/TS) embutidos na API são suficientes para 48h de prazo.
- **O chat precisa manter contexto entre perguntas?** Suposição: sim, ao menos
  dentro da sessão em memória — o próprio exemplo do case é uma cadeia de
  perguntas de acompanhamento (RF12 cobre isso, mas dado que a cadeia
  6→7→8→9 é o fio condutor da demo, tratar o mínimo de contexto necessário
  para essa cadeia como P0, não P1).
- **Precisa de autenticação/multiusuário?** Suposição: não, é um protótipo de
  demonstração para uma pessoa (o entrevistador) em uma sessão local.

## 8. Aplicação de REGRAS_SEGURANCA.md

Pontos do documento de segurança do repositório que se aplicam diretamente a
este levantamento e devem virar critérios de aceite/checklist para quem
implementar:

- **Nenhuma credencial real de ERP/CRM/BI/SharePoint** deve ser usada ou
  citada — os dados são 100% mockados; não há integração real neste MVP.
- **`ANTHROPIC_API_KEY`** é a única credencial real necessária (para a API
  Claude). Deve ser lida exclusivamente de variável de ambiente no backend
  (Next.js API routes), nunca exposta ao client/browser, nunca hardcoded em
  código, prompts, testes, mocks, comentários ou mensagens de commit.
- **`.env.exemplo`** deve ser atualizado no mesmo PR que introduzir a
  integração com a API Anthropic, adicionando `ANTHROPIC_API_KEY=` vazio
  (Regra 2 de REGRAS_SEGURANCA.md).
- **Nenhum arquivo `.env` real** pode ser commitado em nenhuma branch,
  incluindo `develop` (Regra 1). Antes de qualquer commit, seguir o checklist
  da Regra 3 (`git status` limpo de `.env` real, grep por segredos,
  `.env.exemplo` sincronizado).
- Dados sensíveis "de negócio" (orçamentos, contratos, fluxo de caixa) neste
  protótipo são fictícios — mas a arquitetura/UI devem ser desenhadas como se
  fossem dados reais confidenciais (ex.: não logar valores financeiros em
  console/analytics), já que isso é parte do que a apresentação deve
  demonstrar de maturidade para um cenário de produção futuro.
- O **Analista de Segurança** deve revisar o PR do protótipo antes de
  qualquer commit/push, conforme fluxo definido em `CLAUDE.md`.

## 9. Resumo para o Arquiteto

O que precisa existir, no mínimo: (1) uma fonte de dados mockada estruturada
cobrindo cronograma/orçamento/fornecedores/contratos/caixa por empreendimento;
(2) uma camada de API (Next.js) que recebe a pergunta do usuário, monta
contexto a partir dos dados mockados, chama a API Anthropic (com tool use ou
prompt estruturado) e devolve resposta + indicadores citados; (3) uma função
determinística de simulação de atraso → impacto em caixa, chamada pela camada
de IA como "ferramenta" e não inventada por ela; (4) uma UI simples com
painel de KPIs + chat. Tudo o mais é diferencial de apresentação, não
requisito de código.
