/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CONTRACT_ADDRESS_BASE: string
  readonly VITE_CONTRACT_ADDRESS_BASE_SEPOLIA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
