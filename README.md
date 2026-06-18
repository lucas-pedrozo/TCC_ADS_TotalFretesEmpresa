# Total Fretes Empresa

Frontend web (React 19 + TypeScript + Vite) para gestão de fretes.

## Pré-requisitos

- Node.js 20.19+ ou 22.12+
- Backend rodando em `http://localhost:80` (repositório `TCC_ADS_backEnd-TotalFretes`: `docker compose up -d`)

## Desenvolvimento local

```bash
cp .env.example .env
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

### HTTPS local (certificado confiável)

**1. Aponte o domínio local** — adicione ao arquivo `hosts` do Windows (`C:\Windows\System32\drivers\etc\hosts`), como em [`hosts.example`](hosts.example):

```
127.0.0.1 totalfretes.com www.totalfretes.com
```

(Requer editor aberto como Administrador.)

**2. Inicie o servidor HTTPS:**

```bash
npm run dev:https
```

Acesse [https://totalfretes.com](https://totalfretes.com) (porta 443).

Na primeira execução, o [mkcert](https://github.com/FiloSottile/mkcert) gera certificado para `totalfretes.com` e instala a CA local (o Windows pode pedir confirmação de administrador). O navegador não exibirá aviso de certificado inválido.

**Porta 443:** no Windows, execute o terminal **como Administrador**. Se não puder usar a 443, altere em `.env.https`:

```
VITE_DEV_HTTPS_PORT=5173
```

e acesse [https://totalfretes.com:5173](https://totalfretes.com:5173).

O modo HTTPS usa `.env.https`, que define `VITE_API_URL=/api` para que as chamadas passem pelo proxy do Vite (evita mixed content com o backend em HTTP). Se usar o mapa Mapbox, adicione `https://totalfretes.com` nas URLs permitidas do token no painel Mapbox.

Variáveis usadas no dev:

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | Base da API (`http://localhost/api`) |
| `VITE_GATEWAY_URL` | Gateway Nginx para proxy Vite (`http://127.0.0.1:80`) |
| `VITE_MAPBOX_ACCESS_TOKEN` | Token público Mapbox para o mapa |

## Produção via Docker

Com o backend já em execução no host:

```bash
cp .env.example .env   # preencha VITE_MAPBOX_ACCESS_TOKEN
npm run docker:up      # ou: docker compose up --build -d
```

Acesse [http://localhost:8080](http://localhost:8080).

O container serve o build estático com Nginx e faz proxy de `/api` para o backend em `host.docker.internal:80`.

Para parar:

```bash
npm run docker:down
```

**Nota:** variáveis `VITE_*` são embutidas no build. Após alterá-las, execute `docker compose up --build` novamente.

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite, HTTP) |
| `npm run dev:https` | Servidor de desenvolvimento com HTTPS (mkcert) |
| `npm run build` | Build de produção |
| `npm run test:e2e` | Executa testes end-to-end (Playwright, headless) |
| `npm run test:e2e:auth` | Executa apenas o grupo de autenticação |
| `npm run test:e2e:company` | Executa os grupos de empresa em sequência |
| `npm run test:e2e:company:freights` | Executa apenas o grupo de Freights |
| `npm run test:e2e:company:proposals` | Executa apenas o grupo de Proposals |
| `npm run test:e2e:company:history` | Executa apenas o grupo de History |
| `npm run test:e2e:headed` | Executa testes end-to-end com navegador visível |
| `npm run test:e2e:ui` | Abre o runner interativo do Playwright |
| `npm run test:e2e:report` | Abre relatório HTML do último run E2E |
| `npm run preview` | Preview do build local |
| `npm run docker:up` | Sobe o container de produção |
| `npm run docker:down` | Para o container |

## Testes end-to-end (Playwright)

Os testes E2E cobrem o fluxo web de autenticação de empresa e navegação nas páginas de empresa (`Freights`, `Proposals`, `History`), usando seletores estáveis por `data-testid`.

### 1) Pré-requisitos para E2E

- Backend local ativo em `http://localhost:80`.
- Frontend web disponível em `http://localhost:5173` (ou deixe o Playwright subir com `npm run dev` automaticamente).
- Credenciais válidas de empresa para teste.

### 2) Configuração das variáveis

1. Copie o arquivo de exemplo:

```bash
cp tests/e2e/.env.e2e.example tests/e2e/.env.e2e
```

2. Preencha as variáveis no `tests/e2e/.env.e2e`:

- `E2E_BASE_URL` (padrão: `http://localhost:5173`)
- `E2E_COMPANY_EMAIL`
- `E2E_COMPANY_PASSWORD`
- `E2E_INVALID_PASSWORD` (opcional, para cenário de falha)

### 3) Instalação de browsers do Playwright

```bash
npx playwright install
```

### 4) Execução dos testes

```bash
npm run test:e2e
```

Por padrão, o comando `test:e2e` executa os grupos de teste um a um (`auth` e depois `company`), para reduzir carga e facilitar diagnóstico.

### 5) Observações de estabilidade

- Os testes usam `data-testid` para reduzir fragilidade com i18n e mudanças de texto.
- O arquivo `tests/e2e/.env.e2e` está no `.gitignore` para evitar commit de credenciais.
