import { fileURLToPath } from 'node:url'

export const sites = [
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
  {
    name: 'SOFSE Trenes',
    description: 'API de Trenes de SOFSE',
    subdomain: 'trenes.sofse',
    baseDir: '/sites/sofse/trenes',
    specUrl: fileURLToPath(new URL('../assets/trenes.sofse.openapi.json', import.meta.url)),
    tags: ['Transporte'],
  },
  {
    name: 'Georef',
    description: 'API del Servicio de Normalización de Datos Geográficos de Argentina',
    subdomain: 'georef.argentina',
    baseDir: '/sites/argentina/georef',
    specUrl: fileURLToPath(new URL('../assets/georef.argentina.openapi.json', import.meta.url)),
    tags: ['Argentina'],
  },
]
