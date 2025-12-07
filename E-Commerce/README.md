# Plataforma E-Commerce

Este é um projeto completo de E-Commerce Full Stack, desenvolvido com tecnologias modernas para garantir performance, escalabilidade e uma ótima experiência de usuário. O sistema conta com um Frontend responsivo e um Backend robusto com autenticação, gestão de produtos e integração de pagamentos.

## 🚀 Tecnologias Utilizadas

### Frontend
-   **React** (com Vite): Biblioteca principal para construção da interface.
-   **Tailwind CSS**: Framework de estilização para design rápido e responsivo.
-   **React Router Dom**: Gerenciamento de rotas e navegação.
-   **Axios**: Cliente HTTP para comunicação com a API.
-   **React Icons**: Biblioteca de ícones.
-   **React Toastify**: Notificações visuais para o usuário.

### Backend
-   **Node.js & Express**: Ambiente de execução e framework para o servidor.
-   **MongoDB & Mongoose**: Banco de dados NoSQL e ODM para modelagem de dados.
-   **JWT (JSON Web Tokens)**: Autenticação segura de usuários.
-   **Passport.js**: Estratégias de autenticação social (Google, Facebook, Apple).
-   **Stripe**: Integração para processamento de pagamentos.
-   **Multer**: Upload de arquivos (imagens de produtos).
-   **Nodemailer**: Envio de emails transacionais.

## 📂 Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

-   **/Frontend**: Contém todo o código da interface do usuário (Client-side).
-   **/Backend**: Contém a lógica do servidor, API e conexão com banco de dados (Server-side).

## 🛠️ Instalação e Configuração

### Pré-requisitos
-   Node.js instalado.
-   MongoDB instalado ou URI de conexão (MongoDB Atlas).

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd E-Commerce
    ```

2.  **Instale as dependências do Backend:**
    ```bash
    cd Backend
    npm install
    ```

3.  **Instale as dependências do Frontend:**
    ```bash
    cd ../Frontend
    npm install
    ```

### Configuração de Variáveis de Ambiente

#### Backend
Crie um arquivo `.env` na pasta `Backend` com as seguintes variáveis (exemplo):

```env
PORT=5000
MONGO_URI=sua_string_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
# URLs para redirecionamento OAuth
CLIENT_URL=http://localhost:5173

# Configurações de Email (Nodemailer)
EMAIL_HOST=smtp.exemplo.com
EMAIL_PORT=587
EMAIL_USER=seu_email@exemplo.com
EMAIL_PASS=sua_senha_email

# Pagamentos (Stripe)
STRIPE_SECRET_KEY=sua_chave_secreta_stripe

# Autenticação Social (Opcional)
GOOGLE_CLIENT_ID=seu_google_id
GOOGLE_CLIENT_SECRET=seu_google_secret
FACEBOOK_APP_ID=seu_facebook_id
FACEBOOK_APP_SECRET=seu_facebook_secret
APPLE_CLIENT_ID=seu_apple_id
# ... outras chaves necessárias
```

#### Frontend
Crie um arquivo `.env` na pasta `Frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

## ▶️ Como Rodar o Projeto

Para rodar o projeto completamente, você precisará iniciar tanto o servidor quanto o cliente.

### 1. Iniciar o Backend
Abra um terminal, navegue até a pasta `Backend` e execute:

```bash
npm run dev
```
*O servidor rodará geralmente em `http://localhost:5000`.*

### 2. Iniciar o Frontend
Abra um **novo terminal**, navegue até a pasta `Frontend` e execute:

```bash
npm run dev
```
*A aplicação estará disponível geralmente em `http://localhost:5173`.*

## 🌟 Funcionalidades Principais

-   **Autenticação**: Login e Registro de usuários (Local e Social).
-   **Catálogo de Produtos**: Visualização, busca e filtragem de produtos.
-   **Carrinho de Compras**: Adição de itens e gestão do carrinho.
-   **Checkout**: Processo de finalização de compra com integração de pagamentos.
-   **Painel Administrativo**:
    -   Gestão de Produtos (Criar, Editar, Remover).
    -   Gestão de Banners.
    -   Dashboard de Vendas (Implementação futura/parcial).
-   **Perfil do Usuário**: Histórico de pedidos e configurações de conta.
-   **Multimoeda**: Suporte para alternar moedas (BRL, USD, EUR, etc).

## 📦 Tipos de Produtos Oferecidos

A plataforma é especializada na venda de **Ativos Digitais para Designers e Gráficas**:

1.  **Artes Prontas para Impressão**:
    *   Arquivos de alta resolução (300 DPI, CMYK) prontos para enviar para a gráfica.
    *   Exemplos: Cartões de visita, Panfletos, Banners.
2.  **Vetores Editáveis**:
    *   Arquivos fonte (AI, EPS, SVG) que permitem edição completa.
3.  **Fontes Tipográficas**:
    *   Arquivos de fonte para uso comercial ou pessoal.
4.  **Combos e Pacotes**:
    *   Coleções de artes e recursos vendidos em conjunto com desconto.

Cada produto oferece:
*   **Entrega Automática**: Link de download liberado imediatamente após o pagamento.
*   **Especificações Técnicas**: Detalhes claros sobre formato, cores e resolução.
*   **Galeria de Mockups**: Visualização realista de como a arte ficará impressa.

## 🤝 Contribuição

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Faça o Commit (`git commit -m 'Adicionando NovaFeature'`).
4.  Faça o Push (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---
Desenvolvido por Kevin.
