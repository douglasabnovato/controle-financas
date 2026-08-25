# 💻 Módulo Frontend (`client/`) - Controle Finanças

> Interface web reativa e de alta performance desenvolvida em React.js, Vite e Tailwind CSS, focada na experiência *mobile-first* para catalogação e auditoria de despesas.

---

## 🚀 1. Estrutura de Pastas do Módulo

O frontend foi desenhado sob o conceito de componentização modular e desacoplada:

* `src/components/`: Componentes estruturais e modais (Upload, Dashboard, Listagem).
* `src/pages/`: Telas principais de roteamento e fluxo (Home, Dashboard, Catálogo).
* `src/services/`: Camada de integração HTTP com a API utilizando Axios.
* `src/App.jsx`: Roteamento central e gerenciamento de estado global da sessão.
* `src/main.jsx`: Ponto de montagem da aplicação React.
* `vite.config.js`: Configuração de build otimizada para a pasta `/docs` (GitHub Pages).

---

## 🛠️ 2. Detalhes de Implementação Técnica

### 2.1. Gerenciamento de Sessão e BUs (`Home.jsx`)
* **Persistência Local:** O sistema armazena o identificador ativo do perfil do usuário via `localStorage` (como `active_profile_id`), redirecionando para o fluxo de cadastro se necessário.

### 2.2. Upload e Privacidade com Preview (`ReceiptUpload.jsx`)
* **Armazenamento Local Estrito:** A imagem bruta do cupom não é armazenada em servidores externos. O componente gera um preview local via URL de objeto (`URL.createObjectURL`) para validação imediata antes do envio temporário em formato `FormData`.

### 2.3. Progressive Disclosure (`ReceiptsList.jsx`)
* **Auditoria de Itens:** Os metadados macro do cupom aparecem na listagem principal, enquanto os produtos detalhados ficam ocultos em um modal interativo de alta responsividade acionado sob demanda.