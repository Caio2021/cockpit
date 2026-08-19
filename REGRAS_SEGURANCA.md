# Regras de Segurança — Variáveis de Ambiente

Regras obrigatórias para todo agente (humano ou IA) que trabalhar neste repositório.

## Regra 1 — Nenhum `.env` real sobe para o repositório

- Arquivos `.env`, `.env.local`, `.env.*.local`, `.env.production`, `.env.development` (ou qualquer variação com valores reais) **nunca** podem ser commitados ou enviados em push, em nenhuma branch, nenhum PR, nenhuma exceção.
- Isso é reforçado tecnicamente pelo `.gitignore` na raiz do projeto (veja abaixo). Não remova nem enfraqueça essas linhas do `.gitignore` sem alinhar com o time.
- Se um `.env` real for commitado por engano:
  1. Remover o arquivo do histórico (não basta deletar em um novo commit).
  2. Rotacionar/revogar imediatamente todas as credenciais que estavam nesse arquivo (assumir como comprometidas).
  3. Registrar o incidente.

## Regra 2 — Único arquivo de ambiente permitido no repositório: `.env.exemplo`

- O único arquivo do tipo `.env*` que pode ser versionado é **`.env.exemplo`**.
- `.env.exemplo` deve conter **todas as chaves** usadas pela aplicação, mas **sem nenhum valor sensível preenchido** — valores vazios ou placeholders genéricos (ex: `API_KEY=`, `DATABASE_URL=`, ou `DATABASE_URL=<preencha_localmente>`).
- Toda vez que uma nova variável de ambiente for adicionada ao projeto, a mesma chave (vazia) deve ser adicionada em `.env.exemplo` no mesmo PR.
- Nunca colar valores reais (tokens, senhas, connection strings, chaves de API) em `.env.exemplo`, em código, em comentários, em mensagens de commit ou em qualquer arquivo versionado.

## Regra 3 — Checklist antes de qualquer commit/push

- [ ] `git status` não mostra nenhum arquivo `.env` real (apenas `.env.exemplo`, se alterado).
- [ ] Nenhum segredo (senha, token, chave de API, connection string) está hardcoded em código-fonte.
- [ ] Se uma nova variável de ambiente foi criada, ela também foi adicionada (vazia) em `.env.exemplo`.

## Regra 4 — Responsabilidade dos agentes

- O **Analista de Segurança** (ver `.claude/agents/analista-seguranca.md`) é responsável por revisar todo PR em busca de segredos vazados ou arquivos `.env` indevidos antes do merge.
- Qualquer agente (dev, arquiteto, QA, etc.) que perceber um `.env` real staged para commit deve interromper e alertar antes de prosseguir.
