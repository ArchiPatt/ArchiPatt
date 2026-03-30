/// <reference types="vite/client" />

interface ImportMetaEnv {
   readonly VITE_MONITORING_URL?: string
   readonly VITE_RUM_SOURCE?: string
}

interface ImportMeta {
   readonly env: ImportMetaEnv
}
