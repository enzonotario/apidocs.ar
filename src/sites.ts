import { fileURLToPath } from 'node:url'

export interface Site {
  name: string
  description: string
  subdomain: string
  baseDir: string
  specUrl?: string
  tags?: string[]
}

export const sites: Site[] = [
  {
    name: 'Deudores BCRA',
    description: 'Central de Deudores',
    subdomain: 'deudores.bcra',
    baseDir: '/sites/bcra/deudores',
    specUrl: fileURLToPath(new URL('../assets/deudores.bcra.openapi.json', import.meta.url)),
    tags: ['BCRA'],
  },
  {
    name: 'Cheques BCRA',
    description: 'Cheques denunciados',
    subdomain: 'cheques.bcra',
    baseDir: '/sites/bcra/cheques',
    specUrl: fileURLToPath(new URL('../assets/cheques.bcra.openapi.json', import.meta.url)),
    tags: ['BCRA'],
  },
]
