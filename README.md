# 🌱 Investidor Consciente (Livo)

**Guia de bolso para investir com responsabilidade, consciência e tranquilidade.**

Um aplicativo web educacional que ajuda investidores a alinhar seus investimentos a valores ESG (Environmental, Social, Governance), com análise de carteira, scoring de ações da B3 e consultoria por IA.

---

## 🚀 Tecnologias

- **Frontend:** React 17 + TypeScript + TailwindCSS
- **Backend:** Vercel Serverless Functions
- **APIs:** Brapi (dados de mercado), OpenAI (análise IA)
- **Deploy:** Vercel

---

## 📦 Instalação Local

### Pré-requisitos
- Node.js 16+ e npm

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/investidor-consciente.git
cd investidor-consciente
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas chaves:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BRAPI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Opcional
```

4. **Execute o projeto:**
```bash
npm start
```

O app estará disponível em `http://localhost:3000`

---

## 🔐 Variáveis de Ambiente

| Variável | Obrigatória? | Descrição | Onde obter |
|----------|--------------|-----------|------------|
| `OPENAI_API_KEY` | ✅ Sim | Chave da API OpenAI para análise de carteira | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `BRAPI_API_KEY` | ⚠️ Recomendado | Chave da API Brapi para dados de mercado sem rate limit | [brapi.dev/dashboard](https://brapi.dev/dashboard) |

---

## 🌐 Deploy na Vercel

### Método 1: Via Interface Web

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"New Project"**
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   - Vá em **Settings → Environment Variables**
   - Adicione `OPENAI_API_KEY` e `BRAPI_API_KEY`
5. Clique em **Deploy**

### Método 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add OPENAI_API_KEY
vercel env add BRAPI_API_KEY

# Deploy em produção
vercel --prod
```

---

## 📁 Estrutura do Projeto

```
investidor-consciente/
├── api/                    # Serverless Functions (Vercel)
│   ├── consultor.ts       # Análise de carteira com OpenAI
│   ├── esg-scoring.js     # Motor de scoring ESG
│   └── market.js          # Busca de ações na B3
├── src/
│   ├── components/        # Componentes React
│   │   ├── layout/       # Tabs e estrutura
│   │   ├── modals/       # Modais de transação
│   │   └── ui/           # Componentes reutilizáveis
│   ├── data/             # Dados estáticos (ações, glossário)
│   ├── services/         # Integrações com APIs
│   ├── types/            # Tipos TypeScript
│   └── App.tsx           # Componente principal
├── public/               # Assets estáticos
├── .env.example          # Exemplo de variáveis de ambiente
└── package.json
```

---

## 🎯 Funcionalidades

### ✅ Implementadas
- 📊 **Onboarding personalizado** (4 etapas)
- 💼 **Gestão de carteira** (compra/venda de ativos)
- 🔍 **Busca de ações na B3** (dados em tempo real)
- 🌿 **Scoring ESG** baseado em selos B3 (ISE, ICO2, IDIVERSA, etc.)
- 🤖 **Análise de carteira com IA** (OpenAI GPT-4)
- 📈 **Dashboard de performance**
- 🔒 **Segurança:** CORS restrito, validação de input

### 🚧 Roadmap
- [ ] Autenticação de usuários (Supabase/Firebase)
- [ ] Sincronização na nuvem (substituir localStorage)
- [ ] Notificações de mudanças em scores ESG
- [ ] Exportação de relatórios em PDF
- [ ] Modo offline (Service Workers)

---

## 🛡️ Segurança

- ✅ CORS restrito a domínios permitidos
- ✅ Validação de input nas APIs
- ✅ Limitação de tamanho de payload (100KB)
- ✅ Variáveis de ambiente protegidas
- ✅ `.env` no `.gitignore`

---

## 🧪 Testes

```bash
npm test
```

---

## 📝 Licença

Este projeto é de código aberto para fins educacionais.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Desenvolvido com 💚 para investidores conscientes**
