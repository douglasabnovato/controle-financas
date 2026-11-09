# MVP — Controle Finanças

> Fonte única do estado. Tabela atual no topo; as anteriores estão em "Histórico", no fim.

**Nível:** Vitrine (N2), 12 critérios.

**Resumo:** 7 de 12 aplicáveis atendidos (1, 4, 6, 7, 8, 11 e 12). Os 5 parciais (2, 3, 5, 9 e 10) dependem do responsável.

**Finalizado:** sim (todos os critérios que o código resolve estão em "Atende"; os que dependem do responsável têm issue com `depende-do-responsavel`: #7, #18, #19 e #22).

## Critérios em 09/11/2026 (ciclo de 07/11/2026)

| # | Critério | Situação | Evidência (comando, data, resultado) ou o que falta | Issue |
|---|---|---|---|---|
| 1 | Problema e público claros | Atende | Uma frase, em "Problema e hipótese" abaixo | — |
| 2 | Hipótese a validar | Parcial | Meta de 80% proposta; confirmar é do responsável | #22 |
| 3 | Fluxo principal completo | Parcial | No código, cadastro, envio, catálogo, detalhe e painel estão testados (`npm test` no `client`, 09/11/2026: 18 testes passam). No ar, a API é antiga: `curl https://controle-financas-api-71f6.onrender.com/health` deu 404 em 09/11/2026 | #7 |
| 4 | Escopo enxuto | Atende | O que fica fora está em "Fora do MVP" abaixo e em "Fora do escopo" no `PLANO-DE-ACAO.md` (insights, variação de preços, idiomas, Supabase Auth) | — |
| 5 | Medição de uso | Parcial | Leituras aceitas e corrigidas contadas no código e no painel; sem dados até a API atual entrar no ar | #7, #9 |
| 6 | Falhas tratadas | Atende | Envio, IA indisponível, ilegível ou incompleta, lista vazia, carregamento e API fora ou antiga têm mensagem e teste. Desde 09/11/2026, leitura ilegível ou incompleta oferece "Enviar outra foto" (3 testes em `client/src/__tests__/a11y.test.jsx`) | — |
| 7 | Desempenho aceitável | Atende | Lighthouse 12.8.2 local, móvel, no site publicado, 06/11/2026: 1,64 / 1,56 / 1,41 s (mediana 1,56 s), elemento do LCP é o `h1`. A tela inicial não mudou neste ciclo | — |
| 8 | Acessibilidade básica | Atende | Tela inicial: Lighthouse 100 e axe sem violações (02/11/2026). Telas depois do login: `npm test` no `client`, 09/11/2026, axe-core sem violações em `ReceiptUpload`, `ReceiptsList`, `ReceiptDialog` e `DashboardSummary`; o detalhe abre com Enter, prende o Tab, fecha com Esc e devolve o foco (teste de teclado). Limite: o jsdom não calcula contraste; as telas usam as mesmas cores da tela inicial | — |
| 9 | Segurança e conformidade | Parcial | Token em todas as rotas `/api` e saída da IA validada na `main`; a API publicada é anterior à `main` | #7 |
| 10 | Entrega confiável | Parcial | `main` sem proteção; o front é um build versionado em `docs/` | #18, #19 |
| 11 | Testes dos fluxos críticos | Atende | `npm test` no `client`, 09/11/2026: 18 testes passam (2 arquivos). Integração da API com PostgreSQL no job `server` do CI | — |
| 12 | Documentação honesta | Atende | README e este arquivo dizem que a API no ar é antiga, com issue; uma tabela só, resumo batendo com ela | — |

## Problema e hipótese

**Problema e público:** Quem controla gastos da casa ou de um negócio envia a foto de um cupom fiscal e recebe os itens catalogados, sem digitar.

**Hipótese:** Em 80% dos cupons enviados, a pessoa aceita a leitura da IA sem corrigir o total. Proposta inicial, para o responsável confirmar ou trocar (#22). Sem medição, a meta ainda não pode ser conferida.

## Próximas tarefas

- Republicar a API no Render e conferir a autenticação (responsável, #7).
- Medir a taxa de aceite da leitura, depois da #7 (#9).
- Testar o envio de um cupom real (responsável).

## Fora do MVP

Insights, variação de preços e múltiplos idiomas. A lista é uma proposta e pode mudar com a decisão do responsável.

## Histórico

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
