# Arquitetura — Cockpit Inteligente de Gestão de Empreendimentos (Protótipo)

Documento produzido pelo Arquiteto de Software para orientar a implementação do
protótipo descrito em `docs/requisitos.md` (fonte de verdade do escopo) e em
conformidade com `REGRAS_SEGURANCA.md`. Cobre apenas o necessário para a demo
de 15 minutos; a seção 6 ("Visão de produção") é material de apresentação, não
de implementação.

Decisões de stack já fechadas e não revisitadas aqui: Next.js/React com API
routes próprias, LLM Claude via API Anthropic chamada só no backend, dados
100% mockados, sem banco de dados.

---

## 1. Visão geral do fluxo

```
Usuário digita pergunta (Chat UI)
        │
        ▼
POST /api/chat  { message, history }        ← client só reenvia histórico, sem estado de servidor
        │
        ▼
orquestrador (lib/ai/orchestrator.ts)
        │  monta system prompt + tools + history + message
        ▼
Anthropic Messages API (tool use habilitado)
        │
        ├── Claude decide chamar 1+ tools (ex.: getRiskRanking, simulateDelay)
        │        │
        │        ▼
        │   executor local determinístico (lib/ai/tools/*.ts)
        │   lê fixtures em memória, calcula, devolve JSON puro
        │        │
        │        ▼
        │   resultado da tool volta pro Claude (tool_result)
        │
        ▼
Claude produz resposta final em texto (narra o resultado, não recalcula)
        │
        ▼
API route devolve { reply, ... } para o client
        │
        ▼
Chat UI renderiza a resposta; painel de KPIs lê os mesmos fixtures via
  GET /api/kpis (ou import direto, ver seção 3) e não depende do chat.
```

O ponto central da arquitetura é: **a LLM nunca calcula números sozinha**. Ela
só decide *quais* ferramentas chamar e *como narrar* o resultado que a
ferramenta determinística devolveu. Isso implementa diretamente RNF03 e RNF04.

---

## 2. Estrutura de pastas (Next.js App Router)

```
cockpit/                          ← raiz do app Next.js (ver nota abaixo sobre localização)
├── app/
│   ├── layout.tsx                 ← layout raiz, fontes, wrapper geral
│   ├── page.tsx                   ← página única: painel de KPIs + chat lado a lado
│   ├── globals.css
│   └── api/
│       ├── chat/
│       │   └── route.ts           ← POST: recebe {message, history}, chama orchestrator
│       └── kpis/
│           └── route.ts           ← GET: retorna ranking de risco + KPIs (dados já calculados)
│
├── components/
│   ├── chat/
│   │   ├── ChatPanel.tsx          ← input + lista de mensagens + loading state (RNF02)
│   │   ├── ChatMessage.tsx        ← bolha de mensagem (user/assistant), citação de indicadores
│   │   └── useChat.ts             ← hook: mantém histórico em state, chama /api/chat
│   └── kpis/
│       ├── KpiPanel.tsx           ← grid de cards
│       └── RiskCard.tsx           ← card por empreendimento (nome, nível de risco, KPIs-chave)
│
├── lib/
│   ├── data/
│   │   ├── fixtures/
│   │   │   ├── empreendimentos.ts ← array tipado, 6–8 empreendimentos (RF02)
│   │   │   ├── fornecedores.ts
│   │   │   └── contratos.ts
│   │   ├── types.ts               ← Empreendimento, Fornecedor, Contrato, FluxoCaixaPonto, etc.
│   │   └── repository.ts          ← funções puras de leitura (getEmpreendimentos, getById...)
│   │
│   ├── risk/
│   │   ├── calcularRiscoAtraso.ts     ← fórmula documentada (RNF03/RNF04, ver seção 4)
│   │   ├── calcularRiscoFinanceiro.ts
│   │   └── ranking.ts                 ← combina os dois, ordena, classifica alto/médio/baixo
│   │
│   ├── simulation/
│   │   └── simularAtraso.ts       ← função pura: (empreendimentoId, dias) => impacto em caixa
│   │
│   └── ai/
│       ├── client.ts               ← instancia o SDK Anthropic, lê ANTHROPIC_API_KEY (server-only)
│       ├── orchestrator.ts         ← monta prompt, injeta tools, roda o loop de tool use
│       ├── systemPrompt.ts         ← texto do system prompt (papel, tom, regras de citar indicadores)
│       └── tools/
│           ├── definitions.ts      ← schema JSON das tools expostas ao Claude
│           └── handlers.ts         ← implementação: chama lib/risk e lib/simulation, retorna JSON
│
├── .env.exemplo                    ← ANTHROPIC_API_KEY= (vazio) — já existe no root do repo hoje
├── package.json
└── tsconfig.json
```

**Nota sobre localização do app Next.js**: o repositório hoje só tem
`.claude/`, `docs/`, `.env.exemplo`, `CLAUDE.md`, `REGRAS_SEGURANCA.md` na
raiz — nenhum projeto Next.js foi criado ainda. Recomendo rodar
`npx create-next-app@latest` **na raiz do repositório** (não numa subpasta
`cockpit/`), usando TypeScript + App Router + Tailwind (Tailwind acelera o
painel de KPIs sem gastar tempo de demo com CSS). Isso evita duplicar
`.env.exemplo`/`.gitignore`/`README.md` em dois níveis. Os caminhos acima
(`app/`, `lib/`, `components/`) ficam então direto na raiz do repo.

---

## 3. Dados mockados: formato e acesso

### 3.1 Schema (TypeScript, em `lib/data/types.ts`)

Um único tipo `Empreendimento` concentra os dados que hoje viriam de
ERP/CRM/BI/Planejamento/Compras/Financeiro/Engenharia/Diário de Obras — isso é
proposital: no MVP não simulamos separação por sistema de origem, só o dado
unificado que um cockpit real exibiria. Estrutura mínima (RF02):

- `id`, `nome`
- `cronograma`: `{ percentualConcluido, percentualAtrasado, atividadesCriticasAtrasadas }`
- `orcamento`: `{ previsto, realizado }` (permite derivar % de estouro)
- `fornecedoresCriticos`: `Array<{ fornecedorId, diasAtrasoHistorico, criticidade }>`
- `contrato`: `{ dataProximoReajuste, indice, percentualIndiceProjetado }`
- `fluxoCaixaProjetado`: `Array<{ mes, entradas, saidas }>` (série mensal, base para a simulação)

`fornecedores.ts` e `contratos.ts` podem ficar embutidos dentro do próprio
`empreendimentos.ts` (nested) em vez de arquivos/tabelas separadas — mais
simples de manter em 48h, sem "joins" artificiais. Só separe se um mesmo
fornecedor aparecer em múltiplos empreendimentos e isso importar para alguma
resposta (RF08 compara fornecedores entre obras); nesse caso um
`fornecedores.ts` com IDs referenciados por `fornecedoresCriticos[].fornecedorId`
resolve sem virar um mini-banco relacional.

### 3.2 Acesso

`lib/data/repository.ts` expõe funções puras e síncronas (`getEmpreendimentos()`,
`getEmpreendimentoById(id)`) que apenas retornam os arrays importados dos
fixtures — sem cache, sem I/O, sem banco. Tanto `/api/kpis` quanto as tools de
IA (`lib/ai/tools/handlers.ts`) chamam essas mesmas funções: uma única fonte
de verdade, o painel e o chat nunca podem divergir.

---

## 4. Cálculo de risco e simulação (determinístico)

Implementam RNF03/RNF04: são funções puras TypeScript, sem chamada a LLM,
com a fórmula documentada em comentário no próprio código (para poder ser
explicada ao vivo se o entrevistador perguntar "como calculam isso?").

- `calcularRiscoAtraso(emp)`: função simples e explicável de
  `percentualAtrasado` + criticidade dos fornecedores atrasados → score 0–100
  → classificação alto/médio/baixo por faixas (ex.: >66 alto, 33–66 médio,
  <33 baixo). Documentar as faixas no código.
- `calcularRiscoFinanceiro(emp)`: função de `% de estouro de orçamento` +
  exposição a contratos com reajuste pendente próximo → mesmo esquema de
  score/faixas.
- `ranking.ts`: aplica as duas funções a todos os empreendimentos, ordena,
  retorna a lista pronta para `/api/kpis` e para a tool `getRiskRanking`.
- `simularAtraso(empreendimentoId, dias)`: pega `fluxoCaixaProjetado`, aplica
  a regra de deslocamento/impacto (ex.: custos fixos mensais do
  empreendimento proporcionais aos dias de atraso incidem antes das entradas
  previstas — regra simples, documentada) e devolve `{ impactoReais,
  impactoPercentual, explicacaoCalculo }`. Mesma entrada sempre produz mesma
  saída (AC4) porque não há aleatoriedade em nenhum ponto do cálculo.

Essas funções são exatamente o que vira "tool" para o Claude — ver seção 5.

---

## 5. Camada de IA: tool use e orquestração

### 5.1 Por que tool use (e não só prompt com os dados colados)

Colar os dados no prompt e pedir pra LLM "calcular" o impacto do atraso
violaria RNF04 diretamente (a LLM poderia inventar/arredondar/errar o número,
e o resultado não seria reproduzível). Tool use resolve isso: a LLM só decide
*qual* função chamar e com *quais parâmetros*; quem calcula é
`lib/simulation` e `lib/risk`, código determinístico testável isoladamente.

### 5.2 Tools expostas (schema em `lib/ai/tools/definitions.ts`)

| Tool | Parâmetros | Retorna | Cobre |
|---|---|---|---|
| `getRiskRanking` | nenhum | ranking completo com scores e indicadores por empreendimento | RF03, RF07, pergunta 1 |
| `getEmpreendimentoDetalhe` | `empreendimentoId` | todos os campos brutos usados no score (para "explique o motivo") | RF04, pergunta 7 |
| `getFornecedoresProblematicos` | opcional: `empreendimentoId` | fornecedores ordenados por criticidade/atraso | RF08, pergunta 3 |
| `getContratosParaReajuste` | opcional: janela de dias | contratos com reajuste próximo | RF09, pergunta 4 |
| `getRiskFinanceiroRanking` | nenhum | ranking por risco financeiro (separado do de atraso) | RF11, pergunta 5 |
| `simularAtrasoNoCaixa` | `empreendimentoId`, `dias` | impacto quantificado + explicação do cálculo | RF06, pergunta 9 |

`gerarPlanoDeAcao` (RF05, pergunta 8) é a exceção deliberada: **não** é uma
tool determinística — é o próprio Claude que redige o plano de ação em texto,
porque é conteúdo qualitativo (não um número que precise ser reproduzível).
O orquestrador só garante, via system prompt, que o plano cite os indicadores
já retornados por `getEmpreendimentoDetalhe`/`getRiskRanking` na mesma
conversa, em vez de inventar riscos novos.

### 5.3 Fluxo de execução (`lib/ai/orchestrator.ts`)

1. Recebe `{ message, history }` da API route.
2. Monta a lista de mensagens: `systemPrompt` (fixo) + `history` (mensagens
   anteriores da sessão) + nova mensagem do usuário.
3. Chama a API Anthropic com `tools: definitions`.
4. Se a resposta tiver `stop_reason: "tool_use"`: executa o(s) handler(s)
   correspondente(s) em `lib/ai/tools/handlers.ts`, empacota o retorno como
   `tool_result`, e faz uma segunda chamada à API incluindo esse resultado —
   loop simples de no máximo 1–2 iterações (não precisa de loop genérico
   multi-turno de tool use para este escopo, os handlers não encadeiam entre
   si).
5. Retorna o texto final do Claude para a API route, que devolve ao client.

Timeout: a chamada à API Anthropic deve ter um timeout explícito (ex. 15s)
para não deixar RNF05 dependente só do timeout default do SDK.

### 5.4 System prompt (`lib/ai/systemPrompt.ts`)

Instrui: responder sempre em pt-BR (RNF01); sempre usar as tools disponíveis
para qualquer afirmação numérica, nunca declarar indicador sem ter vindo de
uma tool; ao explicar motivo/indicadores, listar os campos concretos
retornados (não prosa genérica — atende RF04/AC1); manter-se no domínio do
cockpit (recusar educadamente perguntas fora do escopo dos dados mockados).

---

## 6. Contexto conversacional (RF12 / cadeia 6→7→8→9)

**Decisão: estado no client, sem sessão de servidor.** O componente de chat
(`useChat.ts`) mantém o array de mensagens (`{role, content}[]`) em `useState`
e reenvia o histórico inteiro a cada `POST /api/chat`. A API route é
stateless — não há sessão, não há cache de servidor, não há necessidade de
IDs de conversa.

Justificativa: é a opção mais simples que atende exatamente ao requisito
(RF12 pede contexto "dentro da sessão", não persistência entre sessões — está
explicitamente fora de escopo). Qualquer estado de servidor (sessão em
memória do processo Node, Redis, etc.) adicionaria complexidade e um novo
ponto de falha sem nenhum ganho para uma demo de 15 minutos com um usuário
único. O único cuidado é limitar o tamanho do histórico reenviado (ex.:
truncar para as últimas ~10 mensagens) para não estourar tokens/latência
numa demo longa — não é esperado que a cadeia 6→7→8→9 chegue perto disso.

Isso também resolve trivialmente o "reaproveitar o mesmo empreendimento da
resposta anterior" (AC2): como o histórico completo (incluindo os
`tool_result` anteriores, se o SDK os expuser no histórico reenviado — ver
nota de implementação abaixo) vai de volta pro Claude, ele já tem o
empreendimento em contexto sem lógica adicional no orquestrador.

*Nota de implementação*: decidir se o client re-envia só texto (role
user/assistant) ou o array de mensagens bruto da API Anthropic (incluindo
blocos de tool_use/tool_result). A segunda opção é mais fiel e evita o Claude
"esquecer" que já rodou uma tool, mas é mais dado trafegando client↔server.
Para o escopo da cadeia 6→7→8→9, texto simples (pergunta/resposta final) já
deve bastar, porque o `system prompt` + a pergunta de acompanhamento
("explique o motivo") geram contexto suficiente para o Claude re-chamar
`getEmpreendimentoDetalhe` do mesmo empreendimento citado na resposta anterior
em texto. Comece pela opção simples (só texto) e só migre para o histórico
bruto da API se, testando a cadeia ao vivo, o Claude perder o fio.

---

## 7. Componentes de UI (alto nível)

`app/page.tsx`: layout de duas colunas (ou empilhado em telas menores) —
`KpiPanel` à esquerda/topo, `ChatPanel` à direita/embaixo. Sem roteamento
adicional, é uma página única (RNF06 pede simplicidade operacional).

- `KpiPanel` + `RiskCard`: busca `/api/kpis` no mount (ou `fetch` direto do
  Server Component, já que os dados são só leitura local — nenhuma
  necessidade de client-side fetching aqui, pode ser Server Component puro
  lendo `lib/data/repository.ts` diretamente, sem round-trip HTTP). Mostra,
  sem precisar perguntar nada (AC6): nome do empreendimento, badge de risco
  (alto/médio/baixo, cor), e 2–3 KPIs-chave (% atraso, % estouro orçamento).
- `ChatPanel`: precisa ser Client Component (estado, input controlado).
  `ChatMessage` deve dar destaque visual a indicadores citados (ex.: lista
  com bullets) em vez de parágrafo corrido, reforçando RF04/AC1 visualmente.
  Loading state (RNF02): mostrar indicador de "pensando..." imediatamente ao
  enviar, antes da resposta chegar.
- Mensagem de erro amigável (AC7/RNF05): se `/api/chat` retornar erro (status
  ≥ 400 ou exceção), `ChatPanel` renderiza uma mensagem de sistema tipo "Não
  consegui processar sua pergunta agora, tente novamente" em vez de travar ou
  quebrar a árvore de componentes (usar um `try/catch` no `useChat` em torno
  do `fetch`, não um Error Boundary — é um erro de rede esperado, não um bug).

---

## 8. Segurança (REGRAS_SEGURANCA.md aplicado)

- `ANTHROPIC_API_KEY` é lida **apenas** em `lib/ai/client.ts`, via
  `process.env.ANTHROPIC_API_KEY`, dentro de código que roda exclusivamente
  em API routes (`app/api/**/route.ts`) — nunca em Client Components, nunca
  em código importado por um arquivo marcado `"use client"`. Next.js só expõe
  ao browser variáveis prefixadas `NEXT_PUBLIC_`; como a key não terá esse
  prefixo, o próprio Next.js já impede vazamento acidental para o bundle do
  client — mas a regra estrutural (chave só é referenciada em código de
  `app/api/` e `lib/ai/`) deve ser respeitada de qualquer forma, como defesa
  em profundidade.
- `lib/ai/client.ts` deve falhar de forma controlada e clara se
  `ANTHROPIC_API_KEY` não estiver setada (throw com mensagem explicativa),
  para que o erro apareça nos logs do servidor e a API route converta isso na
  mensagem amigável do RNF05/AC7 — nunca deixar o processo simplesmente
  quebrar sem explicação.
- `.env.exemplo` (já existe na raiz do repo) deve ganhar a chave
  `ANTHROPIC_API_KEY=` vazia assim que a integração com a API Anthropic for
  implementada, no mesmo commit/PR (Regra 2 de REGRAS_SEGURANCA.md). Hoje o
  arquivo só tem o template comentado — falta a linha real da variável.
- `.env` real (com a key de verdade) já está no `.gitignore` (`.env` +
  `.env.*` com exceção de `.env.exemplo`) — nenhuma ação adicional necessária
  aqui, só confirmar com `git status` antes de cada commit (Regra 3) que
  nenhum `.env` real aparece staged.
- Nunca logar o conteúdo de `fluxoCaixaProjetado`/valores financeiros em
  `console.log` de produção — mesmo sendo dados fictícios, a UI/API devem se
  comportar como se fossem dados reais confidenciais (pedido explícito da
  seção 8 do requisitos.md, para mostrar maturidade na apresentação). Logs de
  debug durante o desenvolvimento tudo bem, mas não devem sobrar em código
  commitado.
- Nenhum nome de empreendimento, fornecedor ou empresa real deve aparecer nos
  fixtures (AC9) — usar nomes claramente fictícios/genéricos (ex.: "Residencial
  Aurora", "Fornecedor Delta Estruturas").

---

## 9. Plano de implementação (passos pequenos e sequenciais)

Cada passo entrega algo testável isoladamente (rodando `npm run dev` e
olhando no browser, ou um teste manual simples), pensado para implementar em
cima de `develop`, um passo por vez.

1. **Bootstrap do projeto**: `create-next-app` na raiz (TypeScript, App
   Router, Tailwind), confirmar que `npm run dev` sobe a página default.
   Ajustar `.gitignore`/`.env.exemplo` se o scaffold gerar os seus próprios
   (mesclar com os já existentes, não duplicar/sobrescrever).
   *Testável*: app sobe em `localhost:3000`.

2. **Fixtures + tipos**: criar `lib/data/types.ts` e
   `lib/data/fixtures/empreendimentos.ts` com 6–8 empreendimentos fictícios
   cobrindo todos os campos da seção 3.1, com variedade proposital de níveis
   de risco (alguns claramente altos, alguns baixos). Criar
   `lib/data/repository.ts`.
   *Testável*: um teste manual/rápido (script Node ou console.log temporário)
   importando o repository e conferindo os dados.

3. **Funções de risco e simulação puras**: `lib/risk/*.ts` e
   `lib/simulation/simularAtraso.ts`, com as fórmulas documentadas.
   *Testável*: testes unitários simples (ex. Vitest, se já não quiser gastar
   tempo configurando framework de teste, um script ad-hoc chamando as
   funções com os fixtures e conferindo os números manualmente já basta para
   o prazo de 48h).

4. **Painel de KPIs (sem IA ainda)**: `app/api/kpis/route.ts` (ou Server
   Component direto, conforme decidido na seção 7) + `KpiPanel`/`RiskCard` na
   `page.tsx`, usando `lib/risk/ranking.ts`.
   *Testável*: abrir a home e ver o ranking de risco renderizado (cobre AC6
   já nesta etapa, antes de qualquer IA entrar em cena).

5. **Cliente Anthropic + endpoint de chat "eco" (sem tools ainda)**:
   `lib/ai/client.ts`, `app/api/chat/route.ts` fazendo uma chamada simples
   ao Claude (sem tools, sem system prompt elaborado) só para validar a
   integração básica (key lida do env, resposta em pt-BR chega ao client).
   *Testável*: perguntar algo simples no chat (ainda sem `ChatPanel` bonito,
   pode ser via `curl`/Postman na rota) e receber resposta da API real.

6. **Tools de leitura de dados**: implementar `getRiskRanking`,
   `getEmpreendimentoDetalhe`, `getFornecedoresProblematicos`,
   `getContratosParaReajuste`, `getRiskFinanceiroRanking` em
   `lib/ai/tools/` e plugar no orquestrador (`lib/ai/orchestrator.ts`).
   *Testável*: perguntas-âncora 1–5 (seção 5 do requisitos.md) funcionando
   via chat cru.

7. **Tool de simulação**: `simularAtrasoNoCaixa`, plugada da mesma forma.
   *Testável*: pergunta 9 ("simule um atraso de 30 dias...") retorna número
   reproduzível (rodar duas vezes, conferir mesmo resultado — AC4).

8. **Plano de ação (RF05)**: ajustar system prompt para gerar plano de ação
   estruturado quando solicitado, reaproveitando o contexto da conversa.
   *Testável*: pergunta 8 isolada e dentro da cadeia 6→7→8→9 completa.

9. **Contexto conversacional no client**: `useChat.ts` mantendo histórico e
   reenviando a cada chamada; `ChatPanel`/`ChatMessage` com UI de verdade
   (loading state, formatação de indicadores em lista).
   *Testável*: rodar a cadeia 6→7→8→9 inteira na UI final, sem repetir o
   nome do empreendimento manualmente (AC2).

10. **Tratamento de erro (RNF05/AC7)**: try/catch em `useChat` e na API
    route, mensagem amigável em caso de falha/timeout da API Anthropic.
    *Testável*: setar `ANTHROPIC_API_KEY` inválida temporariamente e conferir
    que a UI mostra erro legível em vez de travar.

11. **Polish final e ensaio**: revisar cópias em pt-BR, truncamento de
    histórico, checklist de segurança (seção 8 aqui + Regra 3 de
    REGRAS_SEGURANCA.md), rodar as 9 perguntas-âncora em sequência
    cronometrando o tempo de resposta (RNF02, meta ~8s).

Passos 2–4 podem ser feitos em paralelo por dois desenvolvedores (dados/risco
vs. UI de KPIs) já que não dependem da camada de IA. Passos 5–9 são
sequenciais (cada um depende do anterior). O Analista de Segurança deve
revisar antes do primeiro commit que toque `app/api/` ou `lib/ai/` (onde a
key é usada).

---

## 10. Visão de produção (material de apresentação, não implementar)

Enxuto por design — é munição para a entrevista, não um documento à parte.

- **Camada de ingestão/dados**: conectores por sistema de origem (ERP, CRM,
  BI, Compras, SharePoint) alimentando um **data layer unificado** (ex.: um
  warehouse analítico ou uma camada de agregação via ETL/ELT incremental),
  com o mesmo formato de "empreendimento unificado" usado no protótipo — a
  arquitetura de dados do MVP já antecipa esse modelo-alvo.
- **Documentos não estruturados (SharePoint, diário de obras, contratos em
  PDF)**: RAG (busca semântica + citação de trecho-fonte) como complemento às
  tools estruturadas — perguntas sobre cláusulas contratuais ou anotações de
  diário de obra viriam de um índice vetorial, não do data layer relacional.
- **Orquestração multiagente por domínio** (RF14, citado no case): em vez de
  um único conjunto de tools, agentes especializados (cronograma, financeiro,
  suprimentos) coordenados por um agente orquestrador — útil quando o volume
  de tools/domínios cresce a ponto de um único prompt/tool-set ficar
  difícil de manter ou degradar a qualidade das decisões de tool-call.
- **Autenticação e governança**: SSO corporativo, RBAC por
  empreendimento/região, trilha de auditoria de quem perguntou o quê (RF15),
  mascaramento de dados sensíveis por perfil.
- **Persistência e histórico**: conversas e decisões versionadas (útil para
  auditoria de "por que o cockpit recomendou X na data Y").
- **Custo de LLM em escala**: caching de prompt (system prompt e schemas de
  tool são estáticos — prompt caching da API Anthropic reduz custo/latência
  repetida), roteamento para modelos menores em perguntas simples, throttling
  por usuário/empreendimento.
- **Indicadores de sucesso** (para citar como métricas do produto real): taxa
  de perguntas respondidas sem "não sei", tempo médio de resposta, % de
  respostas com indicador citado corretamente (auditoria amostral),
  redução de tempo de reunião de diretoria / tempo até decisão.

---

## 11. Riscos técnicos do protótipo e mitigação

| Risco | Impacto na demo | Mitigação |
|---|---|---|
| Latência da API Anthropic ao vivo (rede do local da entrevista, variação do serviço) | Resposta demora, parece travado | Loading state imediato (RNF02); timeout explícito de ~15s com mensagem de erro em vez de espera infinita; considerar 1–2 respostas "cacheadas"/roteiro ensaiado como plano B se a internet do local for incerta |
| LLM alucinar fora do tool use (inventar número ou indicador não retornado por tool) | Quebra RNF03/RNF04 na frente do entrevistador | Tool use obrigatório para qualquer afirmação numérica (system prompt explícito); todo teste da seção 9 deve incluir checar se o número citado bate com o retorno da tool, não só se "parece plausível" |
| Internet cair / API Anthropic fora do ar durante a demo | Demo para completamente | Testar com antena de celular como fallback de rede; ensaiar um roteiro "modo slides" de contingência (prints/GIF da cadeia 6→7→8→9 funcionando, gravado antes); RNF05 garante que ao menos a tela não quebra, só mostra erro |
| Contexto conversacional se perder na cadeia 6→7→8→9 (Claude não liga a pergunta de acompanhamento ao empreendimento certo) | Quebra o "fio condutor" da demo (AC2) | Testar a cadeia exata das perguntas-âncora várias vezes antes da entrevista; se falhar, migrar do histórico "só texto" para reenviar os blocos de tool_use/tool_result completos (nota da seção 6) |
| Dados mockados pouco variados (todos os empreendimentos parecerem parecidos) | Respostas genéricas, ranking pouco convincente | Desenhar os fixtures deliberadamente com 1 caso claramente alto risco, 1 claramente baixo, resto no meio — narrativa clara para a demo |
| Chave de API exposta por engano (client bundle, log, commit) | Incidente de segurança real, não só falha de demo | Seguir seção 8 à risca; Analista de Segurança revisa antes de qualquer push; nunca imprimir a key em nenhum log |
| Tempo de implementação (48h) apertar e P0 não fechar | Demo sem a cadeia principal | Ordem do plano de implementação (seção 9) prioriza a cadeia 6→7→8→9 e o painel de KPIs antes de qualquer P1 (RF08–RF11); cortar P1 primeiro se necessário, nunca P0 |
