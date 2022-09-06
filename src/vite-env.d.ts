/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_API_MAX_CONCURRENCY: number?;
  readonly VITE_APP_SITE_NAME: string?;
  readonly VITE_APP_SITE_DISABLE_NAME: string?;
  readonly VITE_APP_THEME: string?;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
