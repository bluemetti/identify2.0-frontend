# React + Vite

## Integração com o backend

O frontend envia cada imagem original, uma por vez, para `POST /api/analyze`.
Configure a URL do backend no arquivo `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Para iniciar o backend localmente:

```bash
cd ../identify2.0-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Em outro terminal, inicie o frontend:

```bash
cd identify-app
npm run dev
```

O backend também pode ser iniciado em modo mock, sem carregar o modelo,
definindo `AGAVE_MOCK=1` antes do comando `uvicorn`.

A API detecta as agaves e faz a triagem de saúde: a resposta traz `doentes`
(plantas com suspeita de doença), `sadias`, `taxa_doenca` e a lista `plantas`,
ordenada da mais suspeita para a menos. A imagem devolvida marca só as plantas
com suspeita. É triagem, não diagnóstico: o texto da tela pede conferência em
campo. Contrato completo no `API.md` do backend.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
