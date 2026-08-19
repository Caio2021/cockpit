# Instruções de Criação — Cockpit Inteligente de Gestão de Empreendimentos

## Repositório

Utilizado o GitHub para versionamento do código.

## Estado do projeto

- Requisitos mapeados
- Arquitetura definida
- MVP (Mínimo Produto Viável) criado
- API configurada
- Scaffold do projeto criado
- Dependências instaladas

## Arquitetura utilizada

**Next.js** — escolhido por unificar frontend e backend em uma única arquitetura, o que
torna a implementação e a manutenção (sustentação) mais simples.

- Next.js/React com API Routes próprias
- LLM Claude via API da Anthropic, chamada apenas no backend, como provedor padrão
- Groq como provedor de fallback: entra em ação automaticamente se a Anthropic falhar
  (ex.: sem crédito, indisponibilidade, timeout).
- Dados 100% mockados nesta fase, sem banco de dados

Essa combinação foca 100% na validação da experiência do usuário (UX) e da inteligência
do sistema, sem gastar tempo com infraestrutura de banco de dados, migrações ou
gerenciamento de estado complexo.

### Vantagens do Next.js com API Routes

- **Ambiente único**: frontend e backend rodam no mesmo projeto, facilitando o desenvolvimento.
- **Segurança da chave de API**: a chave da Anthropic (e da Groq) fica oculta no servidor
  (backend), longe do navegador.
- **Deploy rápido**: plataformas como a Vercel publicam o projeto com poucos cliques.

### Vantagens de chamar a LLM no backend

- **Proteção de dados**: evita expor segredos e tokens de acesso no código que vai para o cliente.
- **Controle de requisições**: permite tratar erros, formatar prompts e adicionar camadas
  de segurança antes de falar com a IA.
- **Economia**: facilita o controle de custos e limites de uso da API.

### Vantagens de dados mockados (sem banco de dados nesta fase)

- **Agilidade máxima**: não exige criar tabelas, schemas ou ORMs no começo.
- **Previsibilidade**: o cockpit sempre carrega com dados limpos e estáveis para testes
  ou demonstrações.
- **Foco no valor**: permite testar se a interface e a IA resolvem o problema real do
  usuário antes de construir a base de dados definitiva.

## Como funciona a API (fluxo de uma pergunta)

Há uma única rota de API: `app/api/chat/route.ts`. O navegador nunca fala diretamente
com Anthropic ou Groq — sempre passa por esse endpoint no próprio backend Next.js.

```
Navegador (ChatPanel)
   │  fetch POST /api/chat { message, history }
   ▼
app/api/chat/route.ts        ← única porta de entrada
   │
   ▼
lib/ai/orchestrator.ts → runChat()
   │
   ├── tenta Anthropic (Claude, modelo padrão)
   │        │
   │        ├── sucesso → retorna texto
   │        └── falha (sem crédito, timeout, etc.)
   │                 │
   │                 ▼
   │            tenta Groq (fallback)
   │
   ▼
{ reply: "..." }  →  volta para o navegador
```

### Por que essa arquitetura ?????

- **Tool use em vez de prompt cru**: garante que números (risco, orçamento, simulação)
  vêm de cálculo determinístico, não de "achismo" da IA — isso é o que sustenta o
  requisito do case de "explique o motivo" e "quais indicadores sustentam".
- **Fallback de provedor**: resiliência — se um provedor cair ou ficar sem crédito
  durante a demo, o sistema não quebra, só troca de motor por baixo dos panos, de forma
  transparente para o usuário.
- **API route própria**: não é preciso um backend separado — o Next.js já serve as duas
  pontas (UI e API) no mesmo processo.

## Ferramentas de apoio usadas

- [Google Stitch](https://stitch.withgoogle.com/) — utilizado para criação do layout visual.
- **Obsidian** — utilizado para registrar o contexto do projeto (início, meio e fim),
  espelhando as decisões tomadas durante a implementação:
  `C:\Users\caios\Documents\Obsidian Vault\Cockpit\Requisitos.md`

## Resumo

Foi realizado um MVP com dados mockados, com o objetivo de demonstrar a integração com
IA aplicada à gestão de empreendimentos — provando a experiência antes de investir em
integração com os sistemas reais.

## Evolução futura: banco de dados

O MVP não usa banco de dados de propósito — os dados mockados bastam para validar a
experiência. Se o projeto evoluir para produção e precisar de persistência real, a
escolha do banco depende do tipo de necessidade, e as duas abordagens abaixo podem
inclusive conviver no mesmo sistema (uma para cada tipo de dado):

### Opção 1 — Banco de dados NoSQL (escalabilidade)

Um banco de dados NoSQL serve para armazenar e gerenciar grandes volumes de dados
flexíveis, rápidos e sem uma estrutura rígida de tabelas. Ele ajuda quando o sistema
precisa crescer muito, distribuído em vários servidores, e lidar com informações que
mudam de formato com frequência.

- Indicado para dados de alto volume e formato variável — por exemplo, eventos do Diário
  de Obras, mensagens do sistema de chamados, ou dados semiestruturados vindos de várias
  fontes diferentes.
- Hospedado na AWS (ex.: DynamoDB), aproveitando a escalabilidade sob demanda da nuvem.

### Opção 2 — PostgreSQL na AWS (segurança e estrutura)

PostgreSQL é um banco de dados relacional, indicado quando a integridade e a segurança
dos dados são prioridade — como é o caso de dados financeiros e contratuais dos
empreendimentos, que exigem consistência e regras bem definidas.

- Hospedado na AWS (ex.: RDS para PostgreSQL), aproveitando os recursos de segurança,
  backup automático e controle de acesso da própria nuvem para manter os dados protegidos.
- Preferível quando o schema é bem definido e a integridade referencial importa mais do
  que a flexibilidade de formato.

**Resumindo**: NoSQL para escalabilidade e dados flexíveis; PostgreSQL na AWS para os
dados que exigem mais segurança e consistência estrutural.
