# Smart Analytics 📊

Um dashboard moderno e responsivo construído com React, TypeScript, Vite e Tailwind CSS, com suporte completo a Dark Mode.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)

## ✨ Funcionalidades

- 🎨 **Dark Mode** - Tema claro e escuro com persistência no localStorage
- 📱 **Responsivo** - Layout adaptável para mobile, tablet e desktop
- 🎭 **Tema Customizável** - Paleta de cores personalizadas (Primary, Secondary, Accent)
- 🧭 **Navegação Completa** - Header, Menu lateral e Navbar horizontal
- 🔍 **Busca Integrada** - Campo de pesquisa no header
- 🔔 **Notificações** - Sistema de notificações com badge
- 🎯 **TypeScript** - Tipagem completa para maior segurança
- ⚡ **Vite** - Build rápido e HMR instantâneo
- 🎨 **Heroicons** - Ícones modernos e consistentes

## 🚀 Tecnologias

- [React 18.3](https://react.dev/) - Biblioteca JavaScript para interfaces
- [TypeScript 5.6](https://www.typescriptlang.org/) - Superset tipado do JavaScript
- [Vite 6.0](https://vitejs.dev/) - Build tool de nova geração
- [Tailwind CSS 4.0](https://tailwindcss.com/) - Framework CSS utilitário
- [Heroicons](https://heroicons.com/) - Ícones SVG lindos e feitos à mão

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/smart-analytics.git
cd smart-analytics
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador em `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
smart_x_analytics/
├── public/
│   └── logo_analytics.png
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Menu.tsx
│   │   │   └── Navbar.tsx
│   │   └── ThemeToggle.tsx
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Configuração do Tema

### Cores Personalizadas

O projeto utiliza três paletas de cores customizadas definidas no `src/index.css`:

- **Primary** (Azul) - Cor principal da aplicação
- **Secondary** (Roxo) - Cor secundária para destaques
- **Accent** (Laranja) - Cor de destaque para CTAs

Cada paleta possui 11 variações (50-950) para uso no dark mode.

### Dark Mode

O dark mode é gerenciado através do Context API:

```typescript
import { useTheme } from './context/ThemeContext'

function Component() {
  const { darkMode, toggleDarkMode, setTheme } = useTheme()
  
  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
```

## 🧩 Componentes Principais

### Header
Barra superior fixa com logo, busca, notificações e toggle de tema.

### Menu
Menu lateral responsivo com navegação em árvore, badges e submenu.

### Navbar
Navegação horizontal com tabs e indicador visual da página ativa.

### ThemeToggle
Botão para alternar entre tema claro e escuro.

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 📱 Responsividade

O projeto utiliza breakpoints do Tailwind CSS:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 🎯 Boas Práticas

- ✅ Componentização modular
- ✅ Context API para gerenciamento de estado global
- ✅ TypeScript para tipagem estática
- ✅ Hooks customizados (useTheme)
- ✅ Acessibilidade com ARIA labels
- ✅ Performance otimizada com Vite

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Jaderson Moreira**

- GitHub: [@jadersonmoreira](https://github.com/jadersonmoreira)

## 🙏 Agradecimentos

- [React Team](https://react.dev/)
- [Tailwind Labs](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
- [Vite Team](https://vitejs.dev/)

---