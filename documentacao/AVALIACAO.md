# Avaliação — controle-financas

> Data: 30/10/2026 · Base: `main` · Complementa `ANALISE.md`.

## Evidências

| Item | Resultado |
|---|---|
| Testes do cliente, lint e build | Passam (5 testes); o build coincide com o publicado em `docs/` |
| Testes da API sem banco local | 1 roda, 5 são ignorados |
| CI | Não rodava: o arquivo estava em `ci/` |
| Dependências de produção | 7 alertas (6 altos, 1 moderado), todos corrigidos no PR #5 |
| Front publicado | Abre a tela de configurar acesso |
| API publicada | Responde, mas com comportamento de uma versão anterior à `main`: `/health` dá 404, e a mensagem de `/` é outra |

**Não testado:** cadastro, envio de cupom e leitura por IA no ambiente publicado, para não criar dados reais nem consumir a cota de IA.

## Achados

| # | Severidade | Achado | Encaminhamento |
|---|---|---|---|
| A1 | Alta | A API publicada não corresponde à `main` | Conferir o deploy no Render (issue no repositório) |
| A2 | Alta | Dependências com falhas de segurança | PR #5 |
| A3 | Média | CI inativo, e os testes de integração não rodavam | PR #5 |
| A4 | Baixa | `docs/assets` guarda arquivos antigos que o `index.html` não usa | O próximo build os remove |

## Nota

Nota anterior do portfólio: 6,5. **Nota atual: 7,0 com o PR #5**, condicionada à correção de A1. É um julgamento técnico.
