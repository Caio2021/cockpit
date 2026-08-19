# Cockpit Project

## Segurança de variáveis de ambiente

Regra inegociável do projeto: **nenhum arquivo `.env` real é commitado ou enviado em push**. O único
arquivo de ambiente versionado é `.env.exemplo`, sempre com valores vazios. Regras completas,
checklist e procedimento de incidente em [REGRAS_SEGURANCA.md](./REGRAS_SEGURANCA.md).

Isso é reforçado tecnicamente pelo `.gitignore` (que ignora `.env` e `.env.*`, exceto
`.env.exemplo`) — não enfraqueça essas linhas.

## Time de agentes

Este projeto usa subagentes do Claude Code definidos em `.claude/agents/`, representando um time
completo:

| Agente | Arquivo | Papel |
|---|---|---|
| Arquiteto | `.claude/agents/arquiteto.md` | Arquitetura, decisões técnicas estruturais, revisão de mudanças estruturais |
| Desenvolvedor Backend | `.claude/agents/desenvolvedor-backend.md` | Implementação de APIs, lógica de negócio, dados, integrações |
| Desenvolvedor Frontend | `.claude/agents/desenvolvedor-frontend.md` | Implementação de UI, componentes, integração com backend |
| Analista de Requisitos | `.claude/agents/analista-requisitos.md` | Levantamento e clareza de requisitos e critérios de aceite |
| QA | `.claude/agents/qa.md` | Testes, validação de critérios de aceite, reporte de bugs |
| Analista de Dados | `.claude/agents/analista-dados.md` | Modelagem de dados, queries analíticas, métricas |
| Analista de Segurança | `.claude/agents/analista-seguranca.md` | Revisão de segurança, segredos, vulnerabilidades — pode bloquear merge |

### Fluxo recomendado
1. **Analista de Requisitos** esclarece o pedido e define critérios de aceite.
2. **Arquiteto** valida impacto estrutural quando a mudança não for trivial.
3. **Desenvolvedor Backend** e/ou **Desenvolvedor Frontend** implementam.
4. **Analista de Dados** é envolvido quando há mudança de schema/modelagem/métricas.
5. **QA** valida a implementação contra os critérios de aceite.
6. **Analista de Segurança** revisa antes do merge/push — tem autoridade para bloquear por motivo de
   segurança, incluindo qualquer violação de [REGRAS_SEGURANCA.md](./REGRAS_SEGURANCA.md).

## Convenções gerais
- Sem abstrações prematuras: prefira código simples e direto ao que a tarefa pede.
- Sem comentários explicando o óbvio; comente apenas o porquê de decisões não óbvias.
- Não commitar/dar push sem que o usuário peça explicitamente.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
