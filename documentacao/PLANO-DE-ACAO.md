# Plano de ação — controle-financas

Timebox: 75 min (fullstack com IA).

| MoSCoW | Item | Ganho | Esforço | Status |
|---|---|---|---|---|
| Must | Autenticação por token + detalhe restrito ao perfil (D1) | Alto | Baixo | ✅ |
| Must | Validar saída da IA (D2) | Alto | Baixo | ✅ |
| Must | Corrigir afirmação de privacidade (D3) | Alto | Baixo | ✅ |
| Must | Upload limitado em memória; CORS por lista (D4, D5) | Alto | Baixo | ✅ |
| Should | Feedback sem `alert()`, diálogo acessível (D6) | Médio | Médio | ✅ axe 0 |
| Should | Schema no código + testes (D7) | Médio | Médio | ✅ 11 testes |
| Should | Deduplicação (D8) | Médio | Baixo | ✅ |
| Could | Insights e variação de preços | Alto | Alto | Próximo ciclo |
| Could | Supabase Auth + RLS | Alto | Médio | Próximo ciclo |

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `main`. Nível: Vitrine (N2), 12 critérios.

### Produto

**Problema e público.** Quem controla gastos da casa ou de um pequeno negócio envia a foto de um cupom fiscal e recebe os itens catalogados, sem digitar.

**Hipótese e meta.** Em 80% dos cupons enviados, a pessoa aceita a leitura da IA sem corrigir o total. Meta proposta; confirmar é do responsável (#22). Medir depende da API atual no ar (#7, #9).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| O plano gratuito do Render dorme depois de cerca de 15 min sem uso e leva perto de 1 min para acordar | A tela de entrada confere o `/health` da API e diz à pessoa se ela não respondeu (pode estar acordando) ou se é uma versão antiga | [Render: web services](https://render.com/tutorials/web-service-vs-static-site/web-services), [discussão no GitHub](https://github.com/orgs/community/discussions/197645), [livemy.app: preços do Render](https://livemy.app/blog/render-pricing) |
| A qualidade da foto é o que mais pesa no acerto da leitura, e apps do tipo oferecem "escanear de novo" | Dicas de foto e botão "Enviar outra foto". Virou a #21 | [techinterview: design de app de recibos](https://www.techinterview.org/post/3233475164/design-mobile-receipt-scan-expense/), [techconcepts: OCR de recibos](https://techconcepts.org/blog/expense-receipt-ocr) |
| Cada correção da pessoa é um dado sobre a leitura | Reforça a contagem de leituras aceitas e corrigidas, já no código, como métrica da hipótese (#9) | [techinterview: design de app de recibos](https://www.techinterview.org/post/3233475164/design-mobile-receipt-scan-expense/) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Aviso de API fora ou antiga na entrada | Alto | Baixo | Este ciclo |
| 2 | Resumo do `MVP.md` batendo com a tabela | Alto | Baixo | Este ciclo |
| 3 | Republicar a API da `main` | Alto | Baixo | Responsável (#7) |
| 4 | Medir a taxa de aceite | Alto | Baixo | Depois da #7 (#9) |
| 5 | Proteger a `main` | Alto | Baixo | Responsável (#18) |
| 6 | Front publicado por workflow | Médio | Médio | #19 (com o responsável) |
| 7 | Acessibilidade depois do login | Médio | Médio | Issue (#20) |
| 8 | Dicas de foto e reenviar | Médio | Baixo | Issue (#21) |
| 9 | Confirmar a meta | Médio | Baixo | Responsável (#22) |

**Fora do escopo.** Insights, variação de preços, vários idiomas, Supabase Auth.

### Engenharia

**Arquitetura.** Front React 19 + Vite + Tailwind, com build versionado em `docs/` e publicado no GitHub Pages. API Express no Render (`render.yaml`), PostgreSQL no Supabase, leitura do cupom pelo Gemini. Todas as rotas `/api` exigem o token `API_TOKEN`.

**Riscos.**
- A API publicada é anterior à `main`: `/health` responde 404 (06/11/2026). Tudo o que foi medido vale para a `main`, não para o que está no ar (#7).
- O build em `docs/` pode ficar diferente do código se alguém esquecer de rodar o build (#19).
- Sem proteção na `main`, um push publica o front sem CI (#18).

**Qualidade.**
- Testes: 10 no cliente (4 novos, do aviso da API) e os de integração da API com PostgreSQL no CI.
- Acessibilidade: o aviso usa `role="alert"` pelo componente `Notice` já existente.
- Desempenho: o aviso faz uma chamada com limite de 15 s, sem bloquear a tela.
- Segurança: o `/health` não leva dado pessoal; o token segue só no navegador.

**Definição de pronto.** `npm test` no `server`; `npm run lint`, `npm test` e `npm run build` no `client`; CI verde; `docs/` reconstruída; `MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.**
1. Aviso de API fora ou antiga na tela de entrada, com 4 testes.
2. Front publicado em `docs/` reconstruído.
3. `MVP.md` com o resumo batendo com a tabela; README com estado e próximos passos.

**Vira issue.** #7, #18, #19, #22 (responsável); #9, #20, #21 (agente).

## Ciclo de 07/11/2026

> Executado em 09/11/2026. Branch `feature/2026-11-07` → `developer/sprint-2026-11-12` → `main` (o PR para a `main` fica com o responsável). Nível: Vitrine (N2), 12 critérios.

### Produto

**Problema e público.** O mesmo do ciclo anterior: quem controla gastos envia a foto do cupom e recebe os itens catalogados.

**Hipótese e meta.** Sem mudança: 80% de leituras aceitas sem correção. A meta é do responsável (#22); medir depende da API atual no ar (#7, #9).

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Num diálogo modal, Tab e Shift+Tab não saem do diálogo; Esc fecha; o foco volta a quem abriu | O detalhe do cupom passou a prender o Tab entre os próprios botões (já fechava com Esc e devolvia o foco) | [WAI-ARIA APG: Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| Guias de apps de recibos repetem três cuidados: papel plano, cupom inteiro no quadro, luz sem sombra; e oferecem "escanear de novo" quando a leitura falha | Três dicas na tela de envio e o botão "Enviar outra foto" quando a IA devolve ilegível ou incompleto (#21) | [Spark Receipt: dicas de digitalização](https://www.sparkreceipt.com/blog/receipt-scanning-tips/), [Expensify: problemas no SmartScan](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Troubleshoot-SmartScan-Issues), [FlipperForce: dicas para a IA ler o recibo](https://help.flipperforce.com/en/articles/16654019-is-the-ai-having-trouble-reading-your-receipt-tips-for-a-perfect-scan) |
| Alguns apps deixam a pessoa digitar loja, data e total quando a leitura falha | Fica para uma issue nova (correção manual da leitura) | [FlipperForce](https://help.flipperforce.com/en/articles/16654019-is-the-ai-having-trouble-reading-your-receipt-tips-for-a-perfect-scan) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | axe e teclado nas telas depois do login | Médio | Baixo | Este ciclo (#20) |
| 2 | Foco preso no diálogo do detalhe | Médio | Baixo | Este ciclo |
| 3 | Dicas de foto e "Enviar outra foto" | Médio | Baixo | Este ciclo (#21) |
| 4 | `MVP.md` com uma tabela só | Alto | Baixo | Este ciclo |
| 5 | Republicar a API, proteger a `main`, Pages por Actions, meta | Alto | Baixo | Responsável (#7, #18, #19, #22) |
| 6 | Correção manual da leitura | Médio | Médio | Issue nova |
| 7 | Teste de ponta a ponta do fluxo principal no navegador | Médio | Médio | Issue nova |

**Fora do escopo.** Insights, variação de preços, vários idiomas, Supabase Auth, correção de perspectiva da imagem.

### Engenharia

**Arquitetura.** Sem mudança: React 19 + Vite + Tailwind com build em `docs/` (GitHub Pages); API Express no Render com PostgreSQL no Supabase e leitura pelo Gemini.

**Riscos.**
- A API publicada segue anterior à `main` (`/health` 404 em 09/11/2026). O botão "Enviar outra foto" depende do campo `code` do erro, que a `main` envia; a API antiga pode não enviar, e aí o botão só não aparece.
- `docs/` foi reconstruída neste ciclo; só chega ao site com o merge na `main`.

**Qualidade.**
- Testes: 18 no cliente (8 novos em `client/src/__tests__/a11y.test.jsx`), os de integração da API no CI.
- Acessibilidade: axe-core em `ReceiptUpload`, `ReceiptsList`, `ReceiptDialog` e `DashboardSummary`, sem violações. A regra de contraste fica desligada no jsdom, que não calcula cores.
- Segurança: nenhuma mudança na API, nos segredos ou na hospedagem.

**Definição de pronto.** `npm run lint`, `npm test` e `npm run build` no `client`; CI verde no PR para a sprint; `docs/` reconstruída; `MVP.md` com uma tabela só; README atualizado.

### Plano de ação

**Este ciclo executa.** Foco preso no detalhe; axe e teclado nas telas depois do login (#20); dicas de foto e reenvio (#21); `docs/` reconstruída; `MVP.md` reorganizado.

**Vira issue.** #29 (correção manual da leitura) e #30 (teste de ponta a ponta no navegador). Seguem com o responsável: #7, #18, #19, #22.

## Ciclo de 16/11/2026

> Branch `feature/2026-11-16` → `developer/sprint-2026-11-19` → `main` (o PR para a `main` fica com o responsável). Nível: Vitrine (N2), 12 critérios. Ponto de partida: 8 de 12 em 10/11/2026; o ciclo de 10/11 entrou na `main` pelo PR #33 (16/11/2026).

### Produto

**Problema e público.** Sem mudança: quem controla gastos da casa ou de um negócio envia a foto do cupom e recebe os itens catalogados, sem digitar.

**Hipótese e meta.** Sem mudança: em 80% dos cupons, a pessoa aceita a leitura da IA sem corrigir o total (#22). Hoje "Precisei corrigir" só marca a leitura; a pessoa não consegue consertar loja, data e total, e o painel soma o valor errado.

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Apps de leitura de recibos deixam a pessoa digitar loja, data e total quando a leitura falha | "Precisei corrigir" abre os campos já preenchidos com a leitura; o painel e o catálogo passam a usar o valor corrigido (#29) | [FlipperForce: dicas para a IA ler o recibo](https://help.flipperforce.com/en/articles/16654019-is-the-ai-having-trouble-reading-your-receipt-tips-for-a-perfect-scan) |
| Quando o sistema detecta um erro de digitação, o campo com erro é apontado e o erro é descrito em texto | Cada campo da correção mostra a mensagem em texto, ligada a ele, e o foco vai para o primeiro campo com erro | [W3C, WCAG 2.2: Understanding SC 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) |
| A fonte do Pages passa a "GitHub Actions" em Settings → Pages; um workflow que já publica dispensa o modelo sugerido | O `DEPLOY.md` passa a descrever a publicação pelo CI, e a #19 ganha o passo a passo atualizado | [GitHub Docs: configurar a fonte de publicação do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) |
| Os alertas do Dependabot se ligam em Settings → Advanced Security → Dependabot alerts → Enable | Issue nova com o passo a passo para o responsável; até lá, o critério 9 fica "Parcial" | [GitHub Docs: configurar alertas do Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/configuring-dependabot-alerts) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | Tirar o código antigo da API que nada carrega (`controllers/`, `routes/`, `database/`, `services/geminiService.js`), com rotas sem token | Alto | Baixo | Este ciclo |
| 2 | `MVP.md` honesto: critério 9 "Parcial" com o Dependabot desligado; critério 7 medido de novo; critério 8 com teste de teclado de verdade | Alto | Baixo | Este ciclo |
| 3 | Fluxo principal no navegador só com teclado (Tab, Enter, `keyboard.type`) e foco visível conferido | Médio | Baixo | Este ciclo (#30) |
| 4 | Corrigir loja, data e total da leitura | Médio | Médio | Este ciclo (#29) |
| 5 | Republicar a API, Pages por Actions, GoatCounter, alertas do Dependabot | Alto | Baixo | Responsável (#7, #19, #35, issue nova) |
| 6 | Correção item a item dos produtos | Baixo | Médio | Issue nova |

**Fora do escopo.** Insights, variação de preços, vários idiomas, Supabase Auth, correção de perspectiva da imagem, correção item a item.

### Engenharia

**Arquitetura.** Sem mudança: React 19 + Vite + Tailwind no GitHub Pages; API Express 5 no Render com PostgreSQL no Supabase e leitura pelo Gemini. Rota nova: `PATCH /api/receipts/:id`, com token, validada por `zod`, que só altera o cupom do perfil informado e marca a leitura como corrigida.

**Riscos.**
- A API no ar segue anterior à `main` (`/health` 404 em 16/11/2026). A correção só funciona no site depois da #7.
- A correção pode repetir CNPJ, data com hora e total de outro cupom do perfil; o índice de deduplicação (`uq_receipts_dedupe`, que não usa a loja) recusa, e a API responde 409 com mensagem. Se o banco já tinha duplicados, o índice não existe e o 409 não acontece.
- Hora da compra: se o dia não muda, a hora lida fica (o reenvio da mesma foto segue recusado); se muda, o cupom vai para o meio-dia do dia novo. O formulário preenche a data com o dia gravado, sem o fuso do navegador.
- Fotos de cupom com dados pessoais de terceiros em `assets/modelos/`: saem da árvore neste ciclo; o histórico fica com o responsável (#43).

**Qualidade.**
- Testes: integração da API com PostgreSQL no CI (correção válida, outro perfil, total zero, data inválida, duplicado); Vitest na interface da correção, com axe; Playwright do fluxo só com teclado e da correção, com axe e contraste.
- Acessibilidade: rótulo em cada campo, erro em texto ligado ao campo (`aria-describedby`, `aria-invalid`), Tab preso no diálogo também nos campos. O app não tem tema escuro próprio; o axe roda só no claro.
- Segurança: `npm audit --omit=dev` em `client` e `server`; a rota nova exige o token e o perfil dono do cupom.

**Definição de pronto.** Lint, Vitest e build no `client`; CI verde (`server`, `client`, `e2e`) no PR para a sprint; revisão independente feita; `MVP.md` com uma tabela só e cada "Atende" com comando, data e resultado; README e `DEPLOY.md` atualizados.

### Plano de ação

**Este ciclo executa.** Itens 1 a 4 do backlog; `DEPLOY.md` com a publicação do Pages pelo CI; issue dos alertas do Dependabot.

**Vira issue.** Correção item a item dos produtos (#41); alertas do Dependabot (#38, responsável); fotos no histórico (#43, responsável); tirar a `docs/` (#40); celular (#42). Seguem com o responsável: #7, #19, #22, #35.
