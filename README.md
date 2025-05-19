# 🌐 Minca AI Chat Bot

## 📦 Overview

This repository contains the frontend UI for **Minca AI Assistant**, built using **[React / Vite / Typescript]**.  
The app is now finalized and deployed.

---

## 🛠️ Tech Stack

- **Framework**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Routing**: React Router v7
- **State Management**: Zustand, React Hook Form, Zod
- **Data Fetching**: React Query v5

---

## 🧭 Folder Structure

```shell
├── public/ # Static assets (logos, redirects)
│ ├── logo*.png # Logo images
│ └── \_redirects # Redirect rules (e.g., Netlify)
├── src/
│ ├── components/ # Reusable UI components
│ ├── lib/ # Utilities, helpers
│ │ ├── auth-store.ts # Zustand store for auth state
│ │ ├── queryClient.ts # React Query client config
│ │ ├── types.ts # Global types/interfaces
│ │ └── utils.ts # Helper functions
│ ├── pages/ # Page-level components
│ ├── routes/ # Route definitions
│ ├── services/ # API/service logic
│ ├── App.tsx # Root app component
│ ├── main.tsx # Entry point
│ └── index.css # Global styles
├── .env # Environment variables
├── vite.config.ts # Vite config
├── tsconfig*.json # TypeScript configs
└── README.md # Project documentation
```

---

## ⚙️ Setup Instructions

1. Clone the repository:

   ```sh
   git clone https://github.com/MincaAiAssistant/chat-bot.git
   cd frontend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:5173/
   ```
