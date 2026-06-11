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
| `npm run preview` | Preview do build local |
| `npm run docker:up` | Sobe o container de produção |
| `npm run docker:down` | Para o container |
