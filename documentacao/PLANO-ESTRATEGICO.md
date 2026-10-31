# Plano estratégico — controle-financas

> Criado em 30/10/2026. Diagnóstico em `AVALIACAO.md`.

## Objetivo

Chegar ao nível N2 (vitrine): front e API na mesma versão, fluxos testados, CI ativo e documentação fiel.

## Execução

| Etapa | Entrega | Situação |
|---|---|---|
| 1 | CI ativo, com PostgreSQL, e dependências corrigidas | PR #5 aberto |
| 2 | Avaliação e plano | Este PR |
| 3 | Publicar a versão atual da API | Com o responsável |
| 4 | Testar o fluxo completo no ambiente publicado | Depois da etapa 3 |
| 5 | Teste de ponta a ponta com a IA simulada | Próximo ciclo |

## O que você pode melhorar

- **Arquitetura:** trocar o token único por contas de usuário (Supabase Auth e RLS, já no roadmap) antes de abrir o sistema a outras pessoas.
- **Engenharia:** adicionar ao CI uma verificação da versão publicada e proteger a `main`.
- **Produto:** implementar os insights de variação de preços, que são o maior diferencial previsto.
