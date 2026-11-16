# Deploy · Controle Finanças

Plano de ação para publicar o catálogo de cupons fiscais em hospedagem gratuita: front no GitHub Pages, API no Render e banco no Supabase.

## 1. Desafio

Colocar no ar, sem custo, um monorepo com front React (Vite) e API Express que guarda cupons fiscais no PostgreSQL e lê as fotos com o Gemini, protegendo a API com token, liberando só a origem do front (CORS) e sem expor dados pessoais das fotos de exemplo num repositório público.

## 2. Conteúdo

### Decisão de hospedagem

| Parte | Escolha | Alternativas |
|---|---|---|
| Front (`client/`) | **GitHub Pages pelo GitHub Actions** (job `deploy` do CI, depois de `server`, `client` e `e2e` verdes). Até a troca da fonte (#19), segue a pasta `docs/` da `main` | Pasta `docs/` versionada: vai ao ar sem passar pelo CI, por isso sai depois da troca (#40) |
| API (`server/`) | **Render, Web Service gratuito (`render.yaml`)** | Railway/Fly exigem cartão ou têm crédito limitado; Vercel não roda Express com upload de forma simples |
| Banco | **Supabase (PostgreSQL gratuito)** | Neon também serve; basta trocar a `DATABASE_URL` |

### URLs

| Item | Valor |
|---|---|
| Front | `https://douglasabnovato.github.io/controle-financas/` |
| API usada pelo front (`client/.env.production`) | `https://controle-financas-api-71f6.onrender.com/api` |
| CORS da API (`CORS_ORIGINS`) | `https://douglasabnovato.github.io` (a origem não leva o caminho `/controle-financas`) |

**Atenção à URL da API:** o front aponta para `controle-financas-api-71f6.onrender.com`, não para `controle-financas-api.onrender.com`. O sufixo `-71f6` é o que o Render acrescenta quando o nome já está em uso, então esse é o endereço do serviço que você já criou. O build publicado em `docs/` também usa esse endereço. Veja a decisão na Etapa 3.

### O que foi ajustado

| Mudança | Arquivo | Por quê |
|---|---|---|
| `NODE_VERSION` `"20"` → `"22"` | `render.yaml` | O Node 20 saiu de suporte em abr/2026 |
| `autoDeployTrigger: commit` | `render.yaml` | Cada push na `main` publica a API |
| `healthCheckPath: /health` mantido | `render.yaml` | A rota existe e responde `{"status":"ok"}` (conferido) |
| Node 20 → 22 nos dois jobs | `ci/github-actions-ci.yml` → `.github/workflows/ci.yml` | Mesma versão do Render |
| Seção "Em produção" | `readme.md` | URLs e link para este guia |

`CORS_ORIGINS` já estava fixo em `https://douglasabnovato.github.io` no `render.yaml`; ficam como `sync: false` só os segredos (`DATABASE_URL`, `API_TOKEN`, `GEMINI_API_KEY`).

### Variáveis que o Render vai pedir

| Nome | Valor |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (URI), com a senha do banco. Use a do **Session pooler** (host `...pooler.supabase.com`): a conexão direta do Supabase é só IPv6 e pode falhar no Render |
| `API_TOKEN` | Token forte com 24+ caracteres. Gere com `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`. É o mesmo que você digita na primeira tela do app. Sem ele a API não sobe |
| `GEMINI_API_KEY` | Google AI Studio → Get API key |
| `GEMINI_MODEL` | Já vem `gemini-3.6-flash` pelo blueprint. **Confira no AI Studio se esse modelo existe e está disponível para a sua chave**; se não, troque pelo nome do modelo Flash atual (a leitura dos cupons falha com erro de modelo inexistente) |

### Limitações do plano gratuito

- Render Free: a API dorme após 15 min sem acesso e leva cerca de 1 min para acordar. O front espera até 60 s; se a primeira leitura der tempo esgotado, tente de novo.
- As 750 horas mensais do Render são da conta inteira, somando todos os serviços.
- Supabase Free: 500 MB de banco; o projeto é pausado após 7 dias sem uso (reative no painel).
- Gemini: cota gratuita por minuto e por dia; acima dela a leitura do cupom falha até a cota renovar.

### Segurança e LGPD

- **Fotos em `assets/modelos/`** (conferidas uma a uma; nenhuma mostra CPF):
  - `6-cupom-fiscal-emporio-do-frango-1.jpg` mostra **nome completo e endereço residencial** (rua, número, apartamento, bairro) de uma pessoa. É dado pessoal de terceiro: não deve ficar num repositório público.
  - `1-...bahamas-1.jpg`, `2-...bahamas-2.jpg`, `3-...bahamas-3.jpg` e `informacoes-importantes.jpg` mostram **nomes completos de operadores de caixa** e de gerentes, e os 4 últimos dígitos de cartões.
  - `4-` e `5-...bassamar` não têm dados pessoais (passageiro não identificado).
  - As fotos não são usadas pelo código nem pelos testes.
  - **Em 16/11/2026**, as 5 fotos com dados pessoais (`1-`, `2-`, `3-`, `6-` e `informacoes-importantes.jpg`) saíram da árvore. Ficaram `4-`, `5-` e `7-...pais-e-filhos` (consumidor não identificado). O histórico do Git ainda tem as 5 fotos: aceitar ou limpar é decisão do responsável (#43).
  - Recomendação original: tirar a pasta do Git (`git rm -r --cached assets/modelos`, mantendo os arquivos no seu computador e acrescentando `assets/modelos/` ao `.gitignore`) ou publicar só versões com nomes e endereço cobertos. O histórico do Git continua com as fotos; se o repositório já é público e isso preocupa, a limpeza do histórico (`git filter-repo`) é decisão sua.
- **Token:** o `API_TOKEN` fica salvo no navegador de quem usa o app. Não compartilhe a URL com o token nem use o mesmo token em outro serviço.
- **Dados no banco:** os cupons guardam CNPJ do estabelecimento e itens comprados. Não envie cupons com CPF na nota se não quiser esse dado no banco.

### Validação feita antes da entrega

- API: `npm ci` limpo, 6 testes passando com PostgreSQL 16 local, `/health` e CORS conferidos subindo o servidor, `npm audit --omit=dev` com 0 vulnerabilidades.
- Front: `npm ci` limpo, `oxlint` sem avisos, 5 testes passando, build ok, `npm audit` com 0 vulnerabilidades. O build gerado é idêntico ao que está em `docs/` (mesmos nomes de arquivo), então `docs/` já está em dia.

## 3. Solução (passo a passo)

Branch principal: **`main`**.

### Etapa 0 · Segurança e LGPD

1. Decidir sobre `assets/modelos/` (seção "Segurança e LGPD"). Para tirar do Git mantendo no computador:
   ```bash
   cd /c/ambiente-projeto/ser-mvp/controle-financas
   git rm -r --cached assets/modelos
   echo "assets/modelos/" >> .gitignore   # cria o .gitignore da raiz
   ```
2. Gerar o `API_TOKEN` (comando da tabela acima) e guardar num gerenciador de senhas.
3. No Google AI Studio, criar/confirmar a `GEMINI_API_KEY` e conferir se o modelo `gemini-3.6-flash` existe.

### Etapa 1 · Validar localmente (Git Bash)

1. `cd /c/ambiente-projeto/ser-mvp/controle-financas`
2. API: `cd server && cp .env.example .env` (preencher `DATABASE_URL`, `API_TOKEN`, `GEMINI_API_KEY`), `npm install`, `npm run dev`. Em outro terminal: `curl http://localhost:3000/health` responde `{"status":"ok"}`.
3. Testes da API (opcional, precisa de um PostgreSQL de teste): `TEST_DATABASE_URL=postgres://... npm test` (6 testes).
4. Front: `cd ../client && npm install && npm run lint && npm test && npm run dev` (5 testes). Abrir `http://localhost:5173/controle-financas/`, informar o token e enviar um cupom.

### Etapa 2 · Subir para o GitHub

Feito. A remoção dos arquivos antigos da API (`controllers/`, `routes/`, `database/connection.js`, `services/geminiService.js`) e dos arquivos do modelo do Vite entrou no ciclo de 16/11/2026. O CI está em `.github/workflows/ci.yml`, com os jobs `server`, `client`, `e2e` e `deploy`. Tudo entra na `main` por PR (fluxo `feature/AAAA-MM-DD` → `developer/sprint-<quinta>` → `main`), com `client`, `e2e` e `server` obrigatórios no ruleset da `main`.

### Etapa 3 · API no Render

Escolha **uma** das opções (decisão sua):

- **A. Manter o serviço que já existe** (`controle-financas-api-71f6.onrender.com`), recomendado porque o front já aponta para ele:
  1. Render → serviço `controle-financas-api` → **Settings**: Root Directory `server`, Build `npm ci`, Start `npm start`, Health Check Path `/health`, Auto-Deploy **On Commit**.
  2. **Environment**: `NODE_VERSION=22`, `DATABASE_URL`, `API_TOKEN`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CORS_ORIGINS=https://douglasabnovato.github.io`. Salvar e **Manual Deploy → Deploy latest commit**.
- **B. Criar pelo Blueprint** (infraestrutura como código):
  1. Se o serviço antigo existir, apague-o antes (Settings → Delete Web Service), para liberar o nome.
  2. **New → Blueprint** → repositório `douglasabnovato/controle-financas` → preencher as 3 variáveis secretas → **Apply**.
  3. Anotar a URL criada. Se for diferente de `https://controle-financas-api-71f6.onrender.com`, atualizar `client/.env.production` (`VITE_API_URL=https://<url>/api`), rodar `cd client && npm run build`, e fazer commit de `client/.env.production` e da pasta `docs/` (o nome do `.js` muda).
4. Em ambos: acompanhar **Logs** até `API controle-financas na porta 10000`.

### Etapa 4 · Front no GitHub Pages pelo GitHub Actions (#19)

Em 16/11/2026, `gh api repos/douglasabnovato/controle-financas/pages` responde `build_type: legacy`, com a pasta `/docs` da `main`. A pasta vai ao ar sem passar pelo CI. O job `deploy` do CI já publica o `client/dist`, mas só quando a variável `PAGES_VIA_ACTIONS` é `true`. Passo a passo (responsável):

1. **Settings → Pages → Build and deployment → Source**: trocar "Deploy from a branch" por **GitHub Actions**. Não é preciso escolher modelo de workflow: o `ci.yml` já publica ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)).
2. **Settings → Secrets and variables → Actions → aba Variables → New repository variable**: nome `PAGES_VIA_ACTIONS`, valor `true`.
3. **Actions → CI → Run workflow**, branch `main`. Os jobs `server`, `client`, `e2e` e `deploy` terminam verdes.
4. Conferir: `gh api repos/douglasabnovato/controle-financas/pages --jq .build_type` responde `workflow`, e o site abre a tela "Configurar acesso".

Depois disso, o agente tira a pasta `docs/` e o `outDir: '../docs'` do `client/vite.config.js` por PR (#40). Até lá, quem muda o front roda `cd client && npm run build` (grava em `../docs`) e versiona a `docs/` no mesmo PR.

### Etapa 5 · Conferir no ar

1. `https://controle-financas-api-71f6.onrender.com/health` responde `{"status":"ok"}` (a primeira chamada pode levar ~1 min).
2. `https://controle-financas-api-71f6.onrender.com/api/users/1` sem token responde 401 (a API exige o token em todas as rotas `/api`).
3. Abrir `https://douglasabnovato.github.io/controle-financas/`, informar o `API_TOKEN`, criar o perfil e enviar a foto de um cupom: os itens aparecem no catálogo com código `C001`.
4. DevTools → Console: nenhum erro de CORS. Enviar o mesmo cupom de novo: o app avisa que é duplicado.
5. Abrir o detalhe, clicar em "Precisei corrigir", mudar o total e salvar: aparece "Correção salva.", e o catálogo e o painel mostram o valor novo (a rota `PATCH /api/receipts/:id` só existe na API atual, #7).

### Etapa 6 · Fechar

1. No GitHub, **About → Website**: `https://douglasabnovato.github.io/controle-financas/`.
