/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly ZEGO_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
