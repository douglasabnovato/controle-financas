# MVP — Controle Finanças

> Fonte única do estado. Tabela atual no topo; as anteriores estão em "Histórico", no fim.

**Nível:** Vitrine (N2), 12 critérios.

**Resumo:** 8 de 12 aplicáveis atendidos

**Finalizado:** sim — faltam 3, 5, 9 e 10, que dependem do responsável: republicar a API no Render (#7), trocar a fonte do Pages para GitHub Actions (#19) e criar a conta do GoatCounter (#35)

## Critérios em 10/11/2026 (ciclo da faixa de 90%, decisões D1 a D7 em `engenharia/decisoes/2026-11-10-ciclo-faixa-90.md`)

| # | Critério | Situação | Evidência (comando, data, resultado) ou o que falta | Issue |
|---|---|---|---|---|
| 1 | Problema e público claros | Atende | Uma frase, em "Problema e hipótese" abaixo | — |
| 2 | Hipótese a validar | Atende | Meta decidida pelo coordenador em 10/11/2026 (decisão D1), revisável pelo responsável: 80% dos cupons aceitos sem corrigir o total (abaixo) | #22 |
| 3 | Fluxo principal completo | Parcial | No navegador, com a API real: `npm run test:e2e` no job `e2e` do CI, 10/11/2026 (run 42811414874): 1 passed, percorrendo entrada, envio do cupom, catálogo, detalhe pelo teclado, avaliação e Esc (PostgreSQL de serviço, leitura da IA simulada). No ar, a API é antiga: `curl https://controle-financas-api-71f6.onrender.com/health`, 10/11/2026: 404 (`Cannot GET /health`) | #7 (responsável); validação com pessoa de fora: #36 |
| 4 | Escopo enxuto | Atende | O que fica fora está em "Fora do MVP" abaixo e em "Fora do escopo" no `PLANO-DE-ACAO.md` (insights, variação de preços, idiomas, Supabase Auth) | — |
| 5 | Medição de uso | Parcial | Código pronto; falta a conta (decisão D5). GoatCounter sem cookie (`client/src/lib/medicao.js`), só no build de produção fora de localhost, com o evento `enviar-cupom`; `npx vitest run`, 10/11/2026: 22 de 22, incluindo `medicao.test.js`. A taxa de aceite da leitura (meta do 2) é contada no painel, sem dados até a API atual entrar no ar | #35 (responsável), #7, #9 |
| 6 | Falhas tratadas | Atende | Envio, IA indisponível, ilegível ou incompleta, lista vazia, carregamento e API fora ou antiga têm mensagem e teste (`npx vitest run`, 10/11/2026: 22 de 22) | — |
| 7 | Desempenho aceitável | Atende | Lighthouse 12.8.2 móvel no site publicado (`npx lighthouse https://douglasabnovato.github.io/controle-financas/`), 10/11/2026, 4 execuções válidas: LCP 1,55 / 2,53 / 1,43 / 1,45 s (mediana 1,50 s), TBT 84 / 56 / 51 / 229 ms, elemento do LCP `main > h1` ("Configurar acesso") | — |
| 8 | Acessibilidade básica | Atende | No navegador (Chromium, 1280 px), `npm run test:e2e`, 10/11/2026: axe sem violações, com contraste, na entrada, no painel com o catálogo vazio e no detalhe; detalhe aberto com Enter e fechado com Esc, com o foco de volta no botão. No jsdom, axe nas telas depois do login (`a11y.test.jsx`) | — |
| 9 | Segurança e conformidade | Parcial | Na `main`: token em todas as rotas `/api`, saída da IA validada, `npm audit --omit=dev` 0 vulnerabilidades em `client` e `server` (10/11/2026); dados de teste fictícios (`example.com`). A API publicada é anterior à `main` | #7 (responsável) |
| 10 | Entrega confiável | Parcial | `gh api repos/douglasabnovato/controle-financas/rules/branches/main`, 10/11/2026: `required_status_checks` (`client` e `server`), além de PR obrigatório e bloqueio de force push e exclusão. O CI já tem a publicação do `client/dist` no Pages, travada por `PAGES_VIA_ACTIONS`. Falta: o site ainda sai da pasta `docs/`, que vai ao ar sem passar pelo CI | #19 (responsável) |
| 11 | Testes dos fluxos críticos | Atende | CI do PR do ciclo: `client` (22 testes Vitest), `server` (integração com PostgreSQL) e `e2e` (Playwright com a API real), sem `skip` | — |
| 12 | Documentação honesta | Atende | README e este arquivo dizem que a API no ar é antiga e que o site sai de `docs/`, com issues; uma tabela só, resumo batendo com ela | — |

**Atendidos:** 1, 2, 4, 6, 7, 8, 11 e 12. **Parciais:** 3, 5, 9 e 10, todos à espera do responsável.

## Problema e hipótese

**Problema e público:** Quem controla gastos da casa ou de um negócio envia a foto de um cupom fiscal e recebe os itens catalogados, sem digitar.

**Hipótese (meta do ciclo, texto da proposta mantido):** Em 80% dos cupons enviados, a pessoa aceita a leitura da IA sem corrigir o total. Meta decidida pelo coordenador em 10/11/2026 (decisão D1), revisável pelo responsável (#22). Saberemos pelo painel do app (aceitas e corrigidas) depois que a API atual estiver no ar (#7, #9).

## Próximas tarefas

- Republicar a API no Render e conferir a autenticação (responsável, #7).
- Medir a taxa de aceite da leitura, depois da #7 (#9).
- Testar o envio de um cupom real (responsável).

## Fora do MVP

Insights, variação de preços e múltiplos idiomas. A lista é uma proposta e pode mudar com a decisão do responsável.

## Histórico

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
