/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?worker" {
  const WorkerFactory: new (options?: { name?: string }) => Worker;
  export default WorkerFactory;
}
