# MVP — Controle Finanças

> Fonte única do estado. Tabela atual no topo; as anteriores estão em "Histórico", no fim. Revisto em 18/11/2026, às 21h16: evidências de 6, 8 e 11 com o fluxo no celular (#42) e os refinos da correção (#45).

**Nível:** Vitrine (N2), 12 critérios.

**Resumo:** 8 de 12 aplicáveis atendidos

**Finalizado:** sim — os 4 parciais dependem do responsável, cada um com issue `depende-do-responsavel`: 3 (republicar a API, #7), 5 (conta do GoatCounter, #35), 9 (tirar do ar a API antiga sem token, #47 e #7; os alertas do Dependabot foram ligados em 16/11/2026, #38) e 10 (Pages pelo Actions, #19)

## Produto

- **Problema:** catalogar os itens de um cupom fiscal à mão exige digitar tudo.
- **Público:** quem controla gastos da casa ou de um negócio.
- **Hipótese:** acreditamos que a leitura do cupom pela IA poupa a digitação. Saberemos quando, em 80% dos cupons enviados, a pessoa aceitar a leitura sem corrigir o total.
- **Métrica:** parcela de leituras aceitas sem corrigir o total, medido pelo cartão "Leituras aceitas" do painel do app, depois que a API atual estiver no ar (#7, #9) — meta: 80%, decidida pelo coordenador em 10/11/2026 (D1), revisável pelo responsável (#22).

## Critérios em 16/11/2026 (ciclo de 16/11/2026)

| # | Critério | Situação | Evidência (comando, data, resultado) ou o que falta | Issue |
|---|---|---|---|---|
| 1 | Problema e público claros | Atende | Uma frase, em "Problema e hipótese" abaixo | — |
| 2 | Hipótese a validar | Atende | "Acreditamos que… saberemos quando…" em "Problema e hipótese", com a meta de 80% de leituras aceitas sem corrigir o total (decisão D1 de 10/11/2026, revisável pelo responsável) | #22 |
| 3 | Fluxo principal completo | Parcial | No navegador, com a API real: `npm run test:e2e` no job `e2e` do CI, run [43821745008](https://github.com/douglasabnovato/controle-financas/actions/runs/43821745008), 16/11/2026: 2 passed (entrada, envio do cupom, catálogo, detalhe, avaliação e correção da leitura, PostgreSQL de serviço, leitura da IA simulada). No ar, a API é antiga: `curl https://controle-financas-api-71f6.onrender.com/health`, 16/11/2026: 404 (`Cannot GET /health`, `x-render-origin-server: Render`) | #7 (responsável). A validação com uma pessoa de fora (#36) saiu do MVP pela decisão D2 de 10/11/2026 e não bloqueia o critério |
| 4 | Escopo enxuto | Atende | "Fora do MVP" abaixo e "Fora do escopo" no `PLANO-DE-ACAO.md` (insights, variação de preços, idiomas, Supabase Auth, correção item a item) | — |
| 5 | Medição de uso | Parcial | Código pronto, sem painel: GoatCounter sem cookie (`client/src/lib/medicao.js`), só no build de produção fora de localhost, com o evento `enviar-cupom` (`medicao.test.js` no run 43821745008). Falta a conta do GoatCounter | #35 (responsável), #7, #9 |
| 6 | Falhas tratadas | Atende | `npx vitest run` no job `client`, run [44427454310](https://github.com/douglasabnovato/controle-financas/actions/runs/44427454310), 18/11/2026: 34 de 34. Cobrem lista vazia, carregando, erro com "Tentar novamente", API fora ou antiga (`app.test.jsx`), IA ilegível ou incompleta com reenvio (`a11y.test.jsx`), correção com campo inválido, cupom repetido e correção sem mudança, que não chama a API (`correcao.test.jsx`, #45). Na API, `npm test` no job `server`: 8 de 8, 0 skipped (IA fora → 502, tipo errado → 415, correção inválida → 400, repetida → 409) | — |
| 7 | Desempenho aceitável | Atende | Lighthouse 12.8.2 móvel no site publicado (`npx lighthouse https://douglasabnovato.github.io/controle-financas/ --chrome-flags="--headless --no-sandbox"`), 16/11/2026, 3 execuções válidas: LCP 1,57 / 2,30 / 1,36 s (mediana 1,57 s), TBT 58 / 45 / 110 ms, elemento do LCP `main > h1` ("Configurar acesso"). Regra de descarte: execução com `observedFirstContentfulPaint` acima de 2 s (CPU ocupada por outros testes). Descartadas 4, com FCP observado de 5,0 a 8,9 s; JSON das 7 execuções guardado fora do repositório | — |
| 8 | Acessibilidade básica | Atende | No navegador (Chromium, 1280 px e celular 375 x 812, #42), `npm run test:e2e`, run 44427454310, 18/11/2026: 4 passed (2 por largura), sem rolagem lateral (`scrollWidth <= innerWidth` na entrada, no painel e no detalhe, animações ligadas no celular), só pelo teclado (Tab até cada controle, texto com `keyboard.type`, sem `.focus()` nem `fill()`), com o contorno de foco do app conferido (3px `#1d4ed8`), Tab preso no detalhe, Esc devolvendo o foco e erro da correção ligado ao campo; axe sem violações, com contraste, na entrada, no painel e no detalhe. O app não tem tema escuro próprio: o axe roda só no claro | — |
| 9 | Segurança e conformidade | Parcial | Segue "Parcial" pela API publicada, anterior à `main`, que mantém rotas sem token: GET sem `Authorization` em `/api/users/:id` e `/api/receipts/:id`, 16/11/2026: 500, não 401 (#47, #7). O resto atende: `gh api "repos/douglasabnovato/controle-financas/dependabot/alerts?state=open&per_page=100"`, 16/11/2026 12h00: 0 alertas abertos (alertas ligados pelo responsável nesse dia, #38). `npm audit --omit=dev` depois do `npm ci`, 16/11/2026 12h29: 0 vulnerabilidades em `client` e `server`. Token em todas as rotas `/api` da `main`, inclusive a correção nova; a API antiga sem token (`controllers/`, `routes/`) saiu do código | #47, #7 (responsável); #38 |
| 10 | Entrega confiável | Parcial | `gh api repos/douglasabnovato/controle-financas/rules/branches/main`, 16/11/2026: `deletion`, `non_fast_forward`, `pull_request` e `required_status_checks` (`client`, `e2e` e `server`). `gh api repos/douglasabnovato/controle-financas/pages`, 16/11/2026: `build_type: legacy`, pasta `/docs` da `main`, que vai ao ar sem passar pelo CI. O job `deploy` do CI está pronto, travado por `PAGES_VIA_ACTIONS` | #19 (responsável) |
| 11 | Testes dos fluxos críticos | Atende | Run 44427454310, 18/11/2026: `server` 8 de 8 (`# skipped 0`, PostgreSQL de serviço), `client` 34 de 34, `e2e` 4 passed (desktop e celular). O job `client` também falha se a `docs/` versionada não for o build atual (#45) | — |
| 12 | Documentação honesta | Atende | README, este arquivo e o `DEPLOY.md` dizem que a API no ar é antiga e que o site sai de `docs/`, com issues; uma tabela só, e o resumo bate com ela | — |

**Atendidos:** 1, 2, 4, 6, 7, 8, 11 e 12. **Parciais:** 3, 5, 9 e 10, todos à espera do responsável.

## Problema e hipótese

**Problema e público:** Quem controla gastos da casa ou de um negócio envia a foto de um cupom fiscal e recebe os itens catalogados, sem digitar.

**Hipótese:** Acreditamos que a leitura do cupom pela IA poupa a digitação. Saberemos quando, em 80% dos cupons enviados, a pessoa aceitar a leitura sem corrigir o total. Meta decidida pelo coordenador em 10/11/2026 (decisão D1), revisável pelo responsável (#22). A contagem sai do cartão "Leituras aceitas" do painel do app, depois que a API atual estiver no ar (#7, #9). Desde 16/11/2026, "Precisei corrigir" também conserta loja, data e total (#29), e a correção conta como leitura corrigida.

## Próximas tarefas

- Republicar a API no Render e conferir a autenticação (responsável, #7).
- Trocar a fonte do Pages para GitHub Actions (responsável, #19) e depois tirar a `docs/` (critério 3 da #19).
- Ligar os alertas do Dependabot (responsável, #38) e decidir sobre as fotos no histórico (responsável, #43).
- Medir a taxa de aceite da leitura, depois da #7 (#9).
- Levar à `main` o fluxo no celular (#42) e os refinos da correção (#45), do PR #51.

## Fora do MVP

Insights, variação de preços, múltiplos idiomas e correção item a item dos produtos (#41). A lista é uma proposta e pode mudar com a decisão do responsável.

## Histórico

- 20/11/2026: bloco Produto padronizado, sem mudar critérios.
- 18/11/2026, 21h16: evidências dos critérios 6, 8 e 11 trocadas pelo run 44427454310 (PR #51): `client` 34 de 34, `e2e` 4 passed com a largura de celular (#42), correção sem mudança e data sem fuso (#45). Resumo sem mudança (8 de 12). A #40 foi fechada como duplicada do critério 3 da #19; a #41 segue fora do MVP.
- 16/11/2026, 12h29: critério 9 segue "Parcial" só pela API publicada com rotas sem token (#47, #7). A parte dos alertas trocou: antes a API respondia 403 (alertas desligados, engenharia#33); agora há 0 alertas abertos. Resumo sem mudança (8 de 12).

### Estado de 10/11/2026 (ciclo da faixa de 90%)

**Resumo:** 8 de 12 aplicáveis atendidos (1, 2, 4, 6, 7, 8, 11 e 12). **Finalizado:** sim. Diferenças para a tabela atual: o 8 tinha o teste no navegador com `.focus()` e `fill()`, sem Tab nem foco visível conferido; o 9 estava "Parcial" só pela API antiga, sem conferir os alertas do Dependabot; o 7 vinha de 4 execuções de 10/11/2026 (mediana 1,50 s); não havia a correção de loja, data e total.

### Estado de 10/11/2026, antes do ciclo da faixa de 90%

**Resumo:** 7 de 12 aplicáveis atendidos (1, 4, 6, 7, 8, 11 e 12). **Finalizado:** sim. Diferenças para a tabela atual: o 2 estava "Parcial" (meta sem decisão); o 3 não tinha teste no navegador com a API real; o 5 não tinha a medição de visitas; o 10 não exigia os jobs do CI na `main`.

### Revisão de 06/11/2026 (ciclo de 03/11/2026)

**Nível:** Vitrine (N2), 12 critérios. **Resumo:** 5 de 12 atendidos (1, 6, 7, 11 e 12) e 7 parciais (2, 3, 4, 5, 8, 9 e 10). **Finalizado:** não.

| # | Situação em 06/11/2026 | Evidência ou o que falta | Issue |
|---|---|---|---|
| 2 | Parcial | Meta proposta, sem decisão do responsável | #22 |
| 3 | Parcial | O front abre (200), mas a API publicada é antiga: `/health` responde 404 | #7 |
| 4 | Parcial | Insights e variação de preços seguem no roadmap, fora do MVP | — |
| 5 | Parcial | Contagem de leituras no código; sem dados até a API atual entrar no ar | #9 |
| 6 | Atende | Além do que já havia, a entrada avisa quando a API não responde ou é antiga (4 testes em `client/src/__tests__/app.test.jsx`) | — |
| 8 | Parcial | Telas depois do login sem axe nem teclado | #20 |
| 9 | Parcial | A API publicada é anterior à `main` | #7 |
| 10 | Parcial | `main` sem proteção; front versionado em `docs/` | #18, #19 |
| 12 | Atende | README e este arquivo dizem que a API no ar é antiga, com issue | — |

**Medição depois do merge (06/11/2026):** Lighthouse 12.8.2 local, móvel, no site publicado. Com o aviso da API no topo (PR #23), o aviso virou o elemento do LCP: 2,41 / 3,15 / 2,99 s (mediana 2,99 s). Com o aviso no fim do formulário (PR #25): 1,64 / 1,56 / 1,41 s (mediana 1,56 s), desempenho 98 a 100, acessibilidade 100, e o elemento do LCP voltou a ser o `h1`. O critério 7 segue "Atende".

**Para "Finalizado":** atender 3, 4, 8 e 9, e ter issue `depende-do-responsavel` aberta para 2, 5 e 10. Hoje 3, 5 e 9 esperam a #7.

### Medições de 02/11/2026

Mediana do LCP de 1,55 s (1,65, 1,55 e 1,49 s), desempenho 99, acessibilidade 100. Lighthouse 12.8.2 local, perfil móvel simulado, sem aparelho real.

### Situação em 31/10/2026

| # | Critério | Como verificar | Situação em 31/10/2026 |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Parcial: meta proposta |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: implementado e testado; não exercitado em produção para não criar dados nem gastar cota |
| 4 | Escopo enxuto | O que não entra está registrado | Parcial: insights e variação de preços estão no roadmap |
| 5 | Medição de uso | A métrica principal é coletada | Parcial: leituras aceitas e corrigidas contadas no código e no painel; falta republicar a API (#9) |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: envio, leitura da IA (indisponível, ilegível, incompleta), lista vazia e carregamento têm mensagem no código e nos testes |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Atende na tela inicial: mediana de 1,55 s no site publicado (3 execuções), CLS 0 |
| 8 | Acessibilidade básica | Lighthouse e teclado | Parcial: tela inicial com Lighthouse 100, axe sem violações e foco visível em todos os elementos alcançados por Tab (8 elementos); telas depois do login não testadas |
| 9 | Segurança e conformidade | Riscos decididos; termos de terceiros cumpridos | Parcial: **a API publicada é anterior à `main`** (#7), o que é o maior risco aberto |
| 10 | Entrega confiável | Publicação só depois de CI verde | Parcial: `main` sem proteção; o front é um build versionado em `docs/` |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 5 testes do cliente e 6 de integração no CI |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto, e os números estão certos | Parcial: README correto para a `main`, não para a API publicada |

**Resultado em 31/10/2026:** 4 de 12 critérios atendidos (1, 6, 7 e 11). O texto anterior dizia 2 de 12 e não batia com a tabela; corrigido em 06/11/2026.
