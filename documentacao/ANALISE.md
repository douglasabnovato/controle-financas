# Análise — controle-financas

> Os documentos do projeto ficam em `documentacao/` porque `docs/` é a saída do build publicada no GitHub Pages.

## 1. Especificação

Catálogo de cupons fiscais com leitura por IA: a pessoa fotografa o cupom, a API envia a imagem ao modelo multimodal (Gemini), valida o JSON extraído e grava cupom + itens no PostgreSQL; o painel mostra total gasto, ticket médio e lojas com maior gasto por perfil (Business Unit).

| Ator | Objetivo |
|---|---|
| Dono(a) dos gastos | Registrar despesas sem digitar e enxergar para onde vai o dinheiro por BU |

### Requisitos funcionais

| ID | Requisito | Critério de aceite | Antes |
|---|---|---|---|
| RF01 | Configurar acesso e BU | Com token válido, crio usuário + BU ou uso um perfil existente | ⚠️ cria usuário novo sempre |
| RF02 | Processar cupom | Dado foto válida, vejo "Cupom C001 salvo" com loja e total | ✅ |
| RF03 | Evitar duplicado | O mesmo cupom enviado 2x responde "já cadastrado" | ❌ |
| RF04 | Ver catálogo e itens | Lista do perfil e detalhe com itens | ⚠️ detalhe de qualquer perfil |
| RF05 | Dashboard | Total, ticket médio, top lojas | ✅ |
| RF06 | Insights e variação de preço | — | ❌ não implementado (roadmap) |

### Requisitos não funcionais

| ID | Requisito | Referência |
|---|---|---|
| RNF01 | Só o dono acessa os dados | OWASP A01:2025 (Broken Access Control) |
| RNF02 | Nunca confiar na saída da IA sem validar | OWASP A08/A10:2025 |
| RNF03 | Transparência sobre envio da imagem a terceiro | LGPD art. 6º VI e art. 9º |
| RNF04 | Upload limitado (tamanho e tipo) | OWASP ASVS V12 |

## 2. Defeitos encontrados

| # | Severidade | Defeito |
|---|---|---|
| D1 | Crítica | API sem autenticação; `GET /api/receipts/:id` (id sequencial) devolve qualquer cupom; `GET /api/users/:id` expõe e-mail e WhatsApp |
| D2 | Alta | JSON da IA gravado sem validação (valores/datas inválidos quebram o INSERT) |
| D3 | Alta | README afirma que a imagem fica só no dispositivo; na prática ela é enviada ao Gemini |
| D4 | Média | Upload sem limite de tamanho e tipo; arquivos temporários em disco |
| D5 | Média | CORS liberado para qualquer origem |
| D6 | Média | `alert()` como feedback; rótulos sem `htmlFor`; modal sem papel de diálogo |
| D7 | Média | DDL apenas no README; nenhum teste |
| D8 | Baixa | Cupom duplicado aceito; valores DECIMAL chegam como string no front |

## Rubrica v2 (grupo fullstack)

Aprovação: média ponderada ≥ 7,0 **e** C1 e C4 (eliminatórios) ≥ 5. Regras: nota sem evidência vale no máximo 6; C1 limitado a 7 para parte não executada de ponta a ponta; C9 ≥ 8 só com URL publicada e CI verde.

| # | Critério | Referência | Peso | Antes | Depois | Evidência | Justificativa |
|---|---|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Ries); SWEBOK Requirements | 16% | 6 | 8 | E2E Playwright: configurar → enviar cupom → detalhe (API real + PostgreSQL 16, IA simulada) | Fluxo funciona, mas cria um usuário novo a cada acesso |
| C2 | Estados e condições excepcionais | Nielsen; OWASP A10:2025 | 8% | 3 | 8 | Testes 400/401/404/409/415/502; UI com erro + tentar novamente | `alert()` para tudo; erros só no console |
| C3 | Acessibilidade | WCAG 2.2 AA (axe-core) | 7% | 4 | 8 | axe-core: 0 violações (configuração e painel com diálogo aberto) | Rótulos sem `htmlFor`; modal sem `role="dialog"`; `lang="en"` |
| C4 | Segurança e privacidade | OWASP Top 10:2025 / ASVS 5.0 N1 | 14% | 2 | 7 | Testes: 401 sem token, detalhe de outro perfil = 404, upload 415 | API sem autenticação; `GET /receipts/:id` sequencial expõe cupons de qualquer pessoa (IDOR); CORS aberto; upload sem limite |
| C5 | Dados | 3FN / ACID / fonte única | 10% | 5 | 8 | Schema idempotente testado 2x; dedupe por índice único | DDL só no README; valores DECIMAL chegam como texto |
| C6 | Testes | Pirâmide de testes; SWEBOK Testing | 9% | 0 | 8 | 6 testes de API (PG real) + 5 de UI (Vitest) | Nenhum teste (`npm test` sai com erro). Auditoria: reexecutado com PostgreSQL 16 (TEST_DATABASE_URL): API 6/6 e cliente 5/5 passaram |
| C7 | Qualidade de código | SOLID / camadas; SWEBOK Construction | 7% | 5 | 8 | Revisão: config/lib/repositories/services/app; extrator injetável | Controllers com SQL e regras juntos |
| C8 | Desempenho | Complexidade; Core Web Vitals | 5% | 6 | 7 | LIMIT nas listas; índices por perfil/data | Listas sem limite |
| C9 | Operação | 12-Factor; DORA | 7% | 4 | 7 | `/health`; render.yaml; CI em `ci/` (não executado) | Sem healthcheck; imagens gravadas em `uploads/` no disco |
| C10 | Documentação | README como contrato | 5% | 6 | 8 | README corrigido + docs/ | README detalhado, mas com funções não implementadas |
| C11 | Produto e evidência | Cagan (4 riscos); Torres | 7% | 5 | 7 | Métrica: cupons processados por perfil (dashboard); aviso de privacidade verdadeiro | README diz que a imagem fica só no dispositivo, mas ela vai para o Gemini |
| C12 | Sustentabilidade técnica | OWASP A03:2025; SWEBOK Maintenance | 5% | 6 | 8 | `npm audit`: 0 vulnerabilidades (server e client) | `nodemon` e script de teste inválido |

**Média ponderada:** antes **4,14** (REPROVADO) → depois **7,67** (APROVADO).

