# 📊 Controle Finanças (`controle-financas`)

> Aplicação web inteligente para catalogação, auditoria e inteligência analítica de despesas através de cupons fiscais e comprovantes de rotina.

---

## 🎯 1. Objetivo e Descrição do Projeto

O **controle-financas** é um módulo do ecossistema **LearnTECH** desenvolvido para documentar, praticar e aplicar conceitos avançados de Engenharia de Software, Arquitetura de Produtos Digitais e Inteligência Analítica. 

O objetivo principal da aplicação é **catalogar os cupons fiscais das despesas cotidianas e de viagens**, automatizando a extração de dados através de IA, garantindo a privacidade do usuário (armazenamento local de imagens) e oferecendo um painel consolidado com **Dashboard gerencial** e **Insights de Inteligência**.

---

## 🚀 2. Principais Funcionalidades

- **Autenticação e Perfis de Usuário:** Cadastro com Nome, E-mail, Nickname e WhatsApp, permitindo segmentar os lançamentos por perfis de uso ou Business Units (BUs).
- **Upload Local de Comprovantes:** Envio de imagens (cupons fiscais eletrônicos, SAT, iFood, bilhetes de passagem) mantendo a imagem bruta estritamente no dispositivo local do usuário (privacidade garantida).
- **Extração Automatizada (OCR / IA):** Leitura inteligente e estruturação automática de dados (estabelecimentos, CNPJ, datas, lista de produtos, impostos e descontos).
- **Catalogação Sequencial Única:** Atribuição automática de IDs crescentes (`C001`, `C002`, ...) para rastreabilidade rigorosa e prevenção de duplicidade.
- **Detalhes do Cupom:** Modal interativo de *Progressive Disclosure* para auditar a lista completa de itens de cada compra.
- **Módulo Dashboard:** Visão macro com KPIs de gastos, filtros por período/perfil e gráficos consolidados.
- **Seção de Inteligência & Insights:** Recomendações automatizadas, rastreio de variação de preços de produtos e alertas de gestão por BU.

---

## 🛠️ 3. Especificação Tecnológica (Tech Stack)

A arquitetura do projeto segue o modelo **Client-Server desacoplado**, utilizando tecnologias modernas e de alto desempenho:

### **Frontend**
- **React.js (com Vite):** Biblioteca principal para interfaces reativas e de alta performance.
- **Tailwind CSS:** Framework utilitário para um design system moderno, *clean*, minimalista e totalmente responsivo (*mobile-first*).

### **Backend**
- **Node.js + Express:** API REST modular responsável pelas regras de negócio, controle de IDs sequenciais e processamento.

### **Banco de Dados**
- **PostgreSQL (via Supabase):** Banco de dados relacional robusto para gerenciar usuários, perfis, o catálogo geral de cupons e a lista mestra de produtos.

### **Inteligência e Processamento**
- **Modelos Multimodais de Visão:** Utilizados para a transcrição inteligente de cupons fiscais não estruturados em payloads JSON limpos.

---

## 📂 4. Arquitetura de Dados (Database Schema)

O banco de dados é estruturado em tabelas relacionais normalizadas:

1. **`users` (Usuários):** Armazena dados cadastrais (`id`, `full_name`, `email`, `nickname`, `whatsapp`, `created_at`).
2. **`profiles` (Perfis / BUs):** Segmenta os lançamentos por contexto de uso (`id`, `user_id`, `profile_name`).
3. **`receipts` (Catálogo de Cupons - Visão Geral):** Armazena os metadados macro de cada documento (`id` sequencial como `C001`, `store_name`, `cnpj`, `purchase_date`, `total_amount`, `raw_transcription`).
4. **`products` (Lista Mestra de Produtos - Visão Detalhada):** Detalha cada item associado ao cupom (`id`, `receipt_id`, `product_name`, `quantity`, `unit_price`, `total_price`).


```Plaintext
+-------------------------------------------------------------+
|                Dispositivo do Usuário (Cliente)             |
|                                                             |
|  +-----------------------+       +-----------------------+  |
|  |   Frontend (React)    |       |   Armazenamento Local |  |
|  |   + Tailwind CSS      |       |   (Imagens e Cache)   |  |
|  +-----------------------+       +-----------------------+  |
+-------------------------------------------------------------+
                               |
                        HTTPS / REST API
                               |
                               v
+-------------------------------------------------------------+
|                   Backend (Node.js + Express)               |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  Controladores de Rota & Validação de Negócio         |  |
|  +-------------------------------------------------------+  |
|  +-------------------------------------------------------+  |
|  |  Serviço de IA Multimodal (Visão & Extração OCR)       |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
                               |
                         SQL Relacional
                               |
                               v
+-------------------------------------------------------------+
|              Banco de Dados (PostgreSQL / Supabase)         |
|                                                             |
|  +-------------------+     +-----------------------------+  |
|  | Users & Profiles  |     | Receipts & Master Products  |  |
|  +-------------------+     +-----------------------------+  |
+-------------------------------------------------------------+
```


---

## 💻 5. Visão Geral do Código e Estrutura de Pastas

```text
controle-financas/
├── client/                 # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis (Modais, Tabelas, Cards)
│   │   ├── pages/          # Telas (Dashboard, Meus Cupons, Insights)
│   │   └── services/       # Comunicação com a API (Axios)
│   └── package.json
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Lógica de rotas (Cupons, Produtos, Usuários)
│   │   ├── services/       # Integração com IA de extração e regras de ID
│   │   └── database/       # Configuração e conexões com o PostgreSQL
│   └── package.json
└── README.md
```

## ⚙️ 6. Especificação Arquitetural

O sistema adota uma Arquitetura Client-Server Desacoplada, separando claramente as responsabilidades entre a interface de usuário (Frontend), a camada de lógica de negócios e processamento de IA (Backend) e a persistência relacional (Banco de Dados).

### 2. Camadas da Arquitetura

#### 2.1. Camada de Apresentação (Frontend)
* **Tecnologias:** React.js, Vite e Tailwind CSS.
* **Responsabilidades:**
  * Gerenciamento de rotas e navegação fluida (Dashboard, Gestão de Cupons, Seção de Insights).
  * Experiência Mobile-First otimizada para captura e envio rápido de fotos via dispositivos móveis.
  * Componentes reutilizáveis, incluindo modais para exibição detalhada de itens (Progressive Disclosure).
  * Manutenção estrita das imagens brutas no armazenamento local do usuário, enviando apenas stream temporário para processamento.

#### 2.2. Camada de Serviço e Negócio (Backend)
* **Tecnologias:** Node.js e Express.
* **Responsabilidades:**
  * Fornecer uma API REST modular e segura.
  * Gerenciar regras de autenticação de usuários e seleção de perfis/Business Units (BUs).
  * Executar o algoritmo de catalogação sequencial única (atribuição automática de IDs como C001, C002, ...).
  * Integrar com modelos multimodais de IA para processar as imagens recebidas e convertê-las em estruturas JSON padronizadas.

#### 2.3. Camada de Persistência (Banco de Dados)
* **Tecnologias:** PostgreSQL (via Supabase).
* **Responsabilidades:**
  * Garantir a integridade referencial entre usuários, perfis de uso, cupons fiscais e a lista mestra de produtos.
  * Armazenar metadados fiscais estruturados, valores totais, tributos aproximados e dados brutos de transcrição (JSONB).
 

### 3. Modelo de Dados Relacional (Schema)

O banco de dados é estruturado em tabelas relacionais normalizadas para suportar usuários, perfis, cupons e a lista mestra de produtos.


```sql
-- 1. Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Perfis e Business Units (BUs)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Cupons (Catálogo Geral - Visão Macro)
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50),
    purchase_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    raw_transcription JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Produtos (Lista Mestra - Visão Detalhada)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);
```
 
### 4. Fluxo de Execução End-to-End

* **Captura e Seleção:** O usuário seleciona o perfil/BU desejado e faz o upload da foto do cupom diretamente do seu dispositivo local.
* **Envio Temporário:** O Frontend envia o buffer da imagem para a API Node.js via requisição segura.
* **Extração por IA:** O Backend submete a imagem ao modelo multimodal de visão, que realiza a leitura e devolve os dados estruturados em JSON.
* **Regras de Negócio e ID Único:** O sistema valida duplicidades, calcula o ID sequencial correspondente (C00X) e vincula os dados ao perfil ativo.
* **Persistência Limpa:** O PostgreSQL armazena os dados normalizados. A imagem não é salva no servidor.
* **Consumo no Dashboard:** O Frontend consome os dados para alimentar os gráficos gerenciais, KPIs e a seção analítica de Inteligência.
 

---


## 🌿 7. Workflow Git e Estratégia de Branches

Para garantir a estabilidade do código em produção e organizar o desenvolvimento no ecossistema **LearnTECH**, o projeto adota um fluxo de trabalho baseado em branches direcionadas:

* **`main`:** Branch de produção. Contém apenas versões estáveis e testadas do sistema.
* **`developer-mvp`:** Branch de integração contínua e testes de novas funcionalidades consolidadas antes de irem para produção.
* **`feature/*`:** Branches de desenvolvimento isolado para novas features (ex: `feature/frontend`, `feature/backend`, `feature/ai-integration`).

### **Boas Práticas de Commit e Versionamento**
* O desenvolvimento de novas telas ou serviços deve ser feito obrigatoriamente em uma branch `feature/` dedicada.
* Após a validação local, abra um Pull Request para a branch de integração ou produção, mantendo o histórico limpo e segregado.


---


## 🗺️ Plano de Ação: `controle-financas`

Este plano de ação define as fases estratégicas para a implementação da aplicação, estruturadas em tópicos enumerados para orientar o desenvolvimento técnico no ecossistema LearnTECH.

---

1. **Fase 1: Configuração do Ambiente e Repositório (Setup Inicial)**
   * Inicializar o repositório no GitHub com a estrutura de pastas separada (`client/` e `server/`) e o arquivo `README.md` consolidado.
   * Configurar o projeto frontend com React, Vite e Tailwind CSS.
   * Configurar o projeto backend com Node.js, Express e as dependências essenciais (como `cors`, `dotenv`, `pg` e cliente HTTP).
   * Configurar a instância do PostgreSQL (via Supabase) e executar os scripts DDL das tabelas (`users`, `profiles`, `receipts` e `products`).

2. **Fase 2: Desenvolvimento do Backend (API Core e Regras de Negócio)**
   * Criar as rotas e controladores para o cadastro e gestão de usuários e perfis/Business Units (BUs).
   * Implementar o serviço de recebimento de imagem temporária (mantendo a premissa de armazenamento local no cliente).
   * Integrar a API ao modelo multimodal de visão para processamento das imagens de cupons e conversão em JSON estruturado.
   * Desenvolver a regra de negócio para atribuição automática do ID sequencial único (`C001`, `C002`, ...) e persistência dos dados normalizados nas tabelas `receipts` e `products`.
   * Criar os endpoints de listagem de cupons, detalhamento de itens e agregação de dados para o dashboard.

3. **Fase 3: Desenvolvimento do Frontend (Interfaces e UX)**
   * Desenvolver a tela inicial de cadastro de usuário e a seleção de perfil/BU de trabalho.
   * Criar o componente de upload de imagens com pré-visualização (*preview* local) e envio para o backend.
   * Desenvolver a tela de listagem de cupons (*Catálogo Geral*) contendo o botão de detalhes (*Progressive Disclosure*) para abrir o modal com a lista mestra de produtos.
   * Implementar o *Módulo Dashboard* com os cartões de KPIs (gasto total, ticket médio, impostos) e gráficos consolidados.
   * Desenvolver a *Seção de Inteligência & Insights* para exibir as orientações, alertas de variação de preços e sugestões automatizadas.

4. **Fase 4: Testes, Refinamento e Validação (QA & Deploy)**
   * Realizar testes unitários e de integração no backend para validar regras de IDs sequenciais e persistência.
   * Validar a responsividade e a experiência *mobile-first* no frontend para o fluxo de envio rápido de recibos.
   * Executar testes end-to-end (E2E) simulando o fluxo completo com os cupons de exemplo (Bahamas, iFood, Bassamar, Pais & Filhos).
   * Realizar o deploy da aplicação em ambiente de produção.


---


### 🗺️ Execução do Plano de Ação: `controle-financas`

Este plano de ação define as fases estratégicas para a implementação da aplicação, estruturadas em tópicos enumerados para orientar o desenvolvimento técnico no ecossistema LearnTECH.

---

### Passo a Passo da Fase 1 

#### 1. Criar e Configurar a Estrutura de Pastas (client e server)
No terminal, na raiz do projeto (controle-financas), crie as pastas principais para separar o frontend e o backend:

```Bash
mkdir client server
```

#### 2. Inicializar o Projeto Frontend (client) com React + Vite + Tailwind
Entre na pasta client, crie uma aplicação React usando Vite e instale o Tailwind CSS:

```Bash
cd client
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3. Inicializar o Projeto Backend (server) com Node.js e Express
Volte para a raiz e acesse a pasta server para iniciar o projeto Node e instalar as dependências essenciais:

```Bash
cd ../server
npm init -y
npm install express cors dotenv pg
npm install -D nodemon
```

#### 4. Estruturar os Arquivos de Configuração do Banco de Dados
Ainda na pasta server, crie a pasta de banco de dados e os arquivos essenciais:

```Bash
mkdir src src/database src/controllers src/services
touch src/index.js src/database/connection.js .env
```

No arquivo .env, adicione a string de conexão:

```Env
PORT=3000
DATABASE_URL=sua_string_de_conexao_do_supabase_aqui
```

#### 5. Executar os Scripts DDL no Supabase
Acesse o painel do seu projeto no Supabase, abra o SQL Editor e execute os comandos para criar as tabelas users, profiles, receipts e products.

### Passo a Passo: Execução do DDL e Validação do Banco

#### 1. Acessar o Supabase e o SQL Editor
* Faça login na sua conta do Supabase e abra o painel do seu projeto.
* No menu lateral esquerdo, clique na opção **SQL Editor**.
* Clique em **New query** para criar uma nova aba de consulta em branco.

#### 2. Executar o Script DDL das Tabelas Relacionais
Cole o script DDL completo abaixo no editor SQL do Supabase e clique no botão **Run** (ou pressione `Ctrl + Enter`) para criar as tabelas `users`, `profiles`, `receipts` e `products`:

```sql
-- 1. Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Perfis e Business Units (BUs)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Cupons (Catálogo Geral - Visão Macro)
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(50),
    purchase_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    raw_transcription JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Produtos (Lista Mestra - Visão Detalhada)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);
```

#### 3. Iniciar o Servidor Backend e Validar a Conexão
No seu terminal, certifique-se de que está posicionado na pasta server e execute o comando de desenvolvimento para verificar se a conexão com o PostgreSQL do Supabase foi estabelecida com sucesso:

```Bash
npm run dev
```

#### 6. Registrar as Alterações no Git
Com a estrutura montada, adicione os arquivos ao versionamento:

```Bash
git add .
git commit -m "chore: setup inicial do client react e server node"
```
 

---


### Passo a Passo da Fase 2: Desenvolvimento do Backend (API Core e Regras de Negócio)

Nesta etapa, vamos estruturar os controladores, serviços e rotas do servidor Express para gerenciar usuários, perfis/Business Units (BUs) e o processamento de cupons.

#### 1. Gestão de Usuários e Perfis (BUs)
* **Criar rotas de usuários (`src/routes/userRoutes.js`):**
  * `POST /api/users`: Cadastro de um novo usuário.
  * `GET /api/users/:id`: Busca de dados do usuário e seus perfis vinculados.
* **Criar rotas de perfis (`src/routes/profileRoutes.js`):**
  * `POST /api/profiles`: Criação de uma nova Business Unit (BU) associada ao usuário.

#### 2. Processamento Inteligente de Cupons (Visão Multimodal)
* **Endpoint de Envio e Extração (`src/routes/receiptRoutes.js`):**
  * `POST /api/receipts/process`: Recebe a imagem do cupom enviada pelo cliente.
  * Integração com modelo multimodal de visão para extração e conversão dos dados do cupom em um JSON estruturado.

#### 3. Persistência e Regras de Negócio
* **Regra de Normalização e Gravação:**
  * Persistência dos dados macro na tabela `receipts` (incluindo o JSON bruto de transcrição).
  * Normalização e gravação dos itens detalhados na tabela `products` vinculados ao cupom (`receipt_id`).
* **Endpoints de Consulta e Dashboard:**
  * `GET /api/receipts`: Listagem geral de cupons do perfil/BU.
  * `GET /api/receipts/:id`: Detalhamento completo dos produtos de um cupom específico.
  * `GET /api/dashboard/summary`: Agregação de dados financeiros para o painel principal.

 

### 📌 Melhorias e Refinamentos Futuros do Backend (Backlog Técnico)

Estes itens representam ajustes pontuais mapeados para blindar a API, otimizar a performance e garantir maior resiliência antes da versão final de produção:

1. **Validação Rigorosa de Entrada (Data Sanitization):**
   - Implementar middlewares de validação (ex: Joi ou express-validator) para checar a integridade de UUIDs e campos obrigatórios antes de atingir as camadas de persistência, retornando códigos HTTP padronizados (`400 Bad Request`).

2. **Normalização e Tratamento de Datas pela IA:**
   - Adicionar regras de fallback no serviço de extração (`geminiService.js`) para tratar casos onde o modelo multimodal retorne datas incompletas ou defasadas, garantindo que o carimbo de data/hora respeite o contexto temporal atual.

3. **Paginação e Filtros Avançados de Consulta:**
   - Evoluir a rota `GET /api/receipts` para aceitar parâmetros opcionais de paginação (`page`, `limit`) e filtros por intervalo de datas (`start_date`, `end_date`), evitando gargalos de performance no carregamento de grandes volumes de cupons.

4. **Padronização Global de Respostas de Erro:**
   - Uniformizar o contrato JSON de erro em toda a aplicação (ex: `{ success: false, error: "Mensagem descritiva" }`), facilitando o consumo e exibição de alertas visuais (toasts) no frontend React.



---


### Passo a Passo da Fase 3: Desenvolvimento do Frontend (Interfaces e UX)

Nesta etapa, vamos estruturar a interface de usuário em React com Vite e Tailwind CSS, conectando o ecossistema frontend à nossa API backend.

#### 1. Configuração Inicial e Serviços (`client/src/`)
* **Estrutura de Pastas e Axios (`src/services/api.js`):**
  * Criação das pastas organizacionais (`components/`, `pages/`, `services/`).
  * Configuração da instância do Axios apontando para a API REST do backend (`http://localhost:3000/api`).

#### 2. Tela Inicial de Acesso e Perfil (`src/pages/Home.jsx`)
* **Cadastro e Segmentação (BUs):**
  * Formulário de cadastro de usuário (`POST /api/users`) e vinculação de Business Unit / Perfil (`POST /api/profiles`).
  * Armazenamento local do `active_profile_id` para persistência do contexto de navegação.

#### 3. Componente de Upload de Imagens com Preview (`src/components/ReceiptUpload.jsx`)
* **Envio e Privacidade:**
  * Componente de seleção e pré-visualização local (*preview*) da imagem do cupom no dispositivo do usuário.
  * Envio via `multipart/form-data` para o endpoint de processamento inteligente por IA (`POST /api/receipts/process`).

#### 4. Catálogo Geral e Progressive Disclosure (`src/pages/ReceiptsList.jsx`)
* **Listagem e Auditoria:**
  * Listagem cronológica dos cupons do perfil ativo consumindo `GET /api/receipts`.
  * Modal interativo (*Progressive Disclosure*) para detalhamento individual dos itens normalizados consumindo `GET /api/receipts/:id`.

#### 5. Módulo Dashboard e KPIs Financeiros (`src/components/DashboardSummary.jsx`)
* **Inteligência Analítica:**
  * Cartões de resumo com métricas agregadas (total de cupons, valor total gasto e ticket médio).
  * Ranking dinâmico dos estabelecimentos mais frequentes (*Top Stores*) consumindo `GET /api/receipts/dashboard/summary`.


### 📌 Próximos Passos e Melhorias Futuras (Backlog de Evolução)

Estes itens representam os ajustes funcionais, de experiência do usuário (UX) e de dados estruturais mapeados após os testes práticos iniciais do MVP:

1. **Login de Usuário Já Criado:**
   * **O que fazer:** Implementar um botão de alternância (*toggle*) na tela inicial (`Home.jsx`) para alternar entre o modo de "Cadastro de Novo Usuário" e "Login / Seleção de Perfil Existente". No modo de login, a API deverá buscar os perfis já cadastrados no banco (via endpoint `GET`) e exibi-los em um menu suspenso (*Select*) para que o usuário escolha sua Business Unit (BU) rapidamente sem precisar reinserir os dados cadastrais.

2. **Mensagens Estruturadas (Modais e Alertas Nativos/UI):**
   * **O que fazer:** Substituir os modais nativos do navegador (`alert()`) por componentes visuais flutuantes e elegantes (como *Toasts* de notificação com Tailwind ou modais customizados de sucesso/erro). Isso trará um acabamento profissional e responsivo à interface do ecossistema learnTECH.

3. **Feedback de Processamento e Trava de Ação (Loading State):**
   * **O que fazer:** Adicionar estados de carregamento estruturados nos botões de ação (especialmente no upload de imagens e processamento por IA). O botão deverá ser desativado (`disabled`) imediatamente após o clique para evitar múltiplos envios simultâneos, e será exibido um indicador visual de progresso ou percentual de carregamento para gerenciar a expectativa do usuário durante a chamada assíncrona.

4. **Identificador Único Personalizado do Cupom (ID Alfaneumérico):**
   * **O que fazer:** Evoluir a regra de geração de ID da tabela `receipts` para que o identificador exibido ao usuário combine as **três primeiras letras do nome do cliente** (ou nickname) em maiúsculas com um **número sequencial global** dos cupons cadastrados (ex: `JHO-001`, `JHO-002`). Será necessário ajustar a camada de persistência e a exibição no frontend.

5. **Exibição de Informações Detalhadas do Cupom (Transcrição da Imagem):**
   * **O que fazer:** Expandir o contrato de dados da tabela `receipts` e a visualização no modal de detalhes (*Progressive Disclosure*) para capturar e exibir todas as métricas fiscais e operacionais presentes no cupom. 
   * **Análise e Transcrição dos Dados da Imagem:**
     * **Cabeçalho / Estabelecimento:** `SUPERMERCADO BAHAMAS S/A`, `Loja 019 Mix Ferreira Guimarães`, `Rua Benjamin Guimarães, 315`, `Democrata, Juiz de Fora - MG`, `CNPJ: 17.745.613/0019-60`.
     * **Dados de Operação e Atendimento:** `Gerente: Filipe Pires`, `Tel: (32) 3249-9413`, `COO: 294404`, `OP: 20469`, `Caixa/Operador: Herick Jorge Athayde Halfeld`, `LJ: 19`, `PDV: 11`.
     * **Forma de Pagamento:** `Mastercard (Final 6553)`, `AUT: 103928`, `NSU: 011613`, `DOC: 343013202`, `Venda Débito à Vista`, `ARQC: 7FFA8489E620A29E`, `CTR: 08716311013`.
     * **Totais e Tributos da Compra:** `Qtd. Total de Itens: 24`, `Valor Total: R$ 248,07`, `Desconto: R$ 2,10`, `Acréscimo: R$ 0,00`, `Valor a Pagar: R$ 245,97`, `Volumes: 28`, `Economia na Compra: R$ 2,10`, `Valor Aproximado de Tributos Estaduais: R$ 44,57 (18%) IBPT`.

6. **Tratamento de Conflitos de Extensões e Portas Assíncronas (Console Warnings):**
   * **O que fazer:** Investigar e mitigar os erros de canal fechado gerados por extensões de navegador (`A listener indicated an asynchronous response by returning true...`). No código da aplicação, garantir que todas as chamadas `async/await` e requisições à API tratem corretamente os timeouts e o ciclo de vida das promessas, isolando o ambiente de desenvolvimento de interferências externas de plugins do browser.

---

## 👨‍💻 Autor / Desenvolvedor

Desenvolvido por Senior Fullstack Developer & Product Manager no âmbito do ecossistema LearnTECH.