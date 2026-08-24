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

## 👨‍💻 Autor / Desenvolvedor

Desenvolvido por Senior Fullstack Developer & Product Manager no âmbito do ecossistema LearnTECH.