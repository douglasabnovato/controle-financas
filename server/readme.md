# ⚙️ Módulo Backend (`server/`) - Controle Finanças

> API REST modular desenvolvida em Node.js e Express, responsável pelas regras de negócio, persistência relacional e integração com inteligência artificial multimodal.

---

## 🚀 1. Estrutura de Pastas do Módulo

A API segue o padrão de arquitetura em camadas para isolar responsabilidades:

* `src/controllers/`: Controladores de requisição para usuários, perfis e cupons.
* `src/database/`: Configuração do pool de conexão com o PostgreSQL do Supabase.
* `src/services/`: Integração com IA Multimodal (Google Gemini) e regras de ID sequencial.
* `src/index.js`: Ponto de entrada do servidor Express e injeção de middlewares.
* `package.json`: Gestão de dependências (Express, Cors, Dotenv, Pg, Multer).

---

## 🛠️ 2. Detalhes de Implementação Técnica

### 2.1. Processamento com IA Multimodal (`geminiService.js`)
* **OCR e Visão Computacional:** O backend recebe a imagem temporária via `multipart/form-data` tratada pelo `multer` e submete ao modelo multimodal do Google Gemini, retornando um payload JSON estruturado com o estabelecimento, CNPJ, data, totais e itens.

### 2.2. Persistência e Integridade (PostgreSQL / Supabase)
* **Chaves Relacionais:** Os dados macro são gravados na tabela `receipts` vinculados ao perfil ativo, enquanto os itens individuais são normalizados na tabela `products` com chave estrangeira em cascata (`ON DELETE CASCADE`).

### 2.3. Agregação para o Dashboard
* **Consultas de Resumo:** Endpoints dedicados (`/api/dashboard/summary`) que executam funções de agregação SQL para calcular totais, médias e rankings de estabelecimentos.