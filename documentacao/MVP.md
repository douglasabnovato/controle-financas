# MVP — Controle Finanças

> Criado em 31/10/2026, com os critérios usados no `movies`. Situação baseada em `AVALIACAO.md` e na conferência deste ciclo.

## Problema e hipótese

**Problema e público:** Quem controla gastos da casa ou de um negócio envia a foto de um cupom fiscal e recebe os itens catalogados, sem digitar.

**Hipótese:** Em 80% dos cupons enviados, a pessoa aceita a leitura da IA sem corrigir o total. Proposta inicial, para o responsável confirmar ou trocar. Sem medição, a meta ainda não pode ser conferida.

## 1. Critérios

| # | Critério | Como verificar | Situação em 31/10/2026 |
|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Parcial: meta proposta |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: implementado e testado; não exercitado em produção para não criar dados nem gastar cota |
| 4 | Escopo enxuto | O que não entra está registrado | Parcial: insights e variação de preços estão no roadmap |
| 5 | Medição de uso | A métrica principal é coletada | Parcial: leituras aceitas e corrigidas contadas no código e no painel; falta republicar a API (#9) |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Parcial: há avisos na tela; casos da IA não revistos neste ciclo |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não medido neste ciclo |
| 8 | Acessibilidade básica | Lighthouse e teclado | Não medido neste ciclo |
| 9 | Segurança e conformidade | Riscos decididos; termos de terceiros cumpridos | Parcial: **a API publicada é anterior à `main`** (#7), o que é o maior risco aberto |
| 10 | Entrega confiável | Publicação só depois de CI verde | Parcial: `main` sem proteção; o front é um build versionado em `docs/` |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 5 testes do cliente e 6 de integração no CI |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto, e os números estão certos | Parcial: README correto para a `main`, não para a API publicada |

**Resultado:** 2 de 12 critérios atendidos por inteiro. É um julgamento técnico.

## 2. Tarefas

| # | Tarefa | Situação |
|---|---|---|
| 1 | Republicar a API no Render e conferir a autenticação | Com o responsável (#7) |
| 2 | Medir a taxa de aceite da leitura | Depois de #7 |
| 3 | Testar o envio de um cupom real | Com o responsável |

## 3. Fora do MVP

Insights, variação de preços e múltiplos idiomas. A lista é uma proposta e pode mudar com a decisão do responsável.
