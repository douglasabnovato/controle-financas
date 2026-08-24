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

## ⚙️ 6. Como Executar o Projeto Localmente

### Passo 1: Clone o repositório

```Bash
git clone [https://github.com/SEU-USUARIO/controle-financas.git](https://github.com/SEU-USUARIO/controle-financas.git)
cd controle-financas
Passo 2: Configure o Backend
```

```Bash
cd server
npm install
# Configure suas variáveis de ambiente (.env) com a conexão do PostgreSQL e chaves de IA
npm run dev
```

### Passo 3: Configure o Frontend

```Bash
cd client
npm install
npm run dev
```

## 👨‍💻 Autor / Desenvolvedor

Desenvolvido por Senior Fullstack Developer & Product Manager no âmbito do ecossistema LearnTECH.