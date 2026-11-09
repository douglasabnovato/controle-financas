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
- Testes: 17 no cliente (7 novos em `client/src/__tests__/a11y.test.jsx`), os de integração da API no CI.
- Acessibilidade: axe-core em `ReceiptUpload`, `ReceiptsList`, `ReceiptDialog` e `DashboardSummary`, sem violações. A regra de contraste fica desligada no jsdom, que não calcula cores.
- Segurança: nenhuma mudança na API, nos segredos ou na hospedagem.

**Definição de pronto.** `npm run lint`, `npm test` e `npm run build` no `client`; CI verde no PR para a sprint; `docs/` reconstruída; `MVP.md` com uma tabela só; README atualizado.

### Plano de ação

**Este ciclo executa.** Foco preso no detalhe; axe e teclado nas telas depois do login (#20); dicas de foto e reenvio (#21); `docs/` reconstruída; `MVP.md` reorganizado.

**Vira issue.** #29 (correção manual da leitura) e #30 (teste de ponta a ponta no navegador). Seguem com o responsável: #7, #18, #19, #22.
