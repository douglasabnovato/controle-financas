# Deploy · Controle Finanças

Plano de ação para publicar o catálogo de cupons fiscais em hospedagem gratuita: front no GitHub Pages, API no Render e banco no Supabase.

## 1. Desafio

Colocar no ar, sem custo, um monorepo com front React (Vite) e API Express que guarda cupons fiscais no PostgreSQL e lê as fotos com o Gemini, protegendo a API com token, liberando só a origem do front (CORS) e sem expor dados pessoais das fotos de exemplo num repositório público.

## 2. Conteúdo

### Decisão de hospedagem

| Parte | Escolha | Alternativas |
|---|---|---|
| Front (`client/`) | **GitHub Pages servindo a pasta `docs/` da `main`** (como já era) | Pages por GitHub Actions: possível, mas o build não depende de segredo e já está versionado e em dia; mudar não traz ganho agora |
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
  - Recomendação: tirar a pasta do Git (`git rm -r --cached assets/modelos`, mantendo os arquivos no seu computador e acrescentando `assets/modelos/` ao `.gitignore`) ou publicar só versões com nomes e endereço cobertos. O histórico do Git continua com as fotos; se o repositório já é público e isso preocupa, a limpeza do histórico (`git filter-repo`) é decisão sua.
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

1. Remover os arquivos substituídos:
   ```bash
   cd /c/ambiente-projeto/ser-mvp/controle-financas
   git rm -r server/src/controllers server/src/routes
   git rm server/src/database/connection.js server/src/services/geminiService.js
   git rm client/src/App.css client/src/assets/hero.png client/src/assets/react.svg client/src/assets/vite.svg
   git rm docs/assets/index-D6EnjMIh.css docs/assets/index-bamriI8r.js
   ```
2. Ativar o CI:
   ```bash
   mkdir -p .github/workflows && mv ci/github-actions-ci.yml .github/workflows/ci.yml && rmdir ci
   ```
3. `git status` (não podem aparecer `server/.env` nem `node_modules/`; `docs/` deve ter só `index.html`, `favicon.svg`, `icons.svg`, `assets/index-B_dx3wcT.js` e `assets/index-D1SaPdD9.css`)
4. `git add -A`
5. `git commit -m "chore(deploy): Node 22 no Render e no CI, auto deploy e guia de publicação"`
6. `git push origin main`
7. Aba **Actions**: os jobs `server` e `client` precisam ficar verdes.

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

### Etapa 4 · Front no GitHub Pages

1. **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, pasta **/docs**.
2. Quando mudar algo no front: `cd client && npm run build` (grava em `../docs`), commit de `docs/` e push. O CI testa, mas quem publica é a pasta versionada.

### Etapa 5 · Conferir no ar

1. `https://controle-financas-api-71f6.onrender.com/health` responde `{"status":"ok"}` (a primeira chamada pode levar ~1 min).
2. `https://controle-financas-api-71f6.onrender.com/api/users/1` sem token responde 401 (a API exige o token em todas as rotas `/api`).
3. Abrir `https://douglasabnovato.github.io/controle-financas/`, informar o `API_TOKEN`, criar o perfil e enviar a foto de um cupom: os itens aparecem no catálogo com código `C001`.
4. DevTools → Console: nenhum erro de CORS. Enviar o mesmo cupom de novo: o app avisa que é duplicado.

### Etapa 6 · Fechar

1. No GitHub, **About → Website**: `https://douglasabnovato.github.io/controle-financas/`.
