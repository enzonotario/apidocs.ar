import axios from 'axios'
import { removeLetterFromVersion } from './utils/removeLetterFromVersion.ts'

const DIVISAS_PATH = '/estadisticascambiarias/v1.0/Maestros/Divisas'
const COTIZACIONES_MONEDA_PATH = '/estadisticascambiarias/v1.0/Cotizaciones/{codMoneda}'

export async function transform(spec) {
  spec.info.version = removeLetterFromVersion(spec.info.version)

  const divisas = await getDivisas(spec)

  Object.entries(spec.paths).forEach(([path, methods]) => {
    if (path === COTIZACIONES_MONEDA_PATH) {
      if (methods.get) {
        methods.get.parameters = methods.get.parameters.map((param) => {
          if (param.name === 'codMoneda') {
            return {
              ...param,
              schema: {
                type: 'string',
                enum: divisas.map(divisa => divisa.codigo),
                example: 'USD',
              },
            }
          }
          return param
        })
      }
    }
  })

  return spec
}

async function getDivisas(spec) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

  try {
    const response = await axios(spec.servers[0].url + DIVISAS_PATH)
    return response.data.results || []
  }
  catch (error) {
    console.error('Error fetching divisas:', error.message)
    return []
  }
}
