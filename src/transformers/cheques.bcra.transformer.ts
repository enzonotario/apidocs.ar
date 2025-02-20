import axios from 'axios'
import { removeLetterFromVersion } from './utils/removeLetterFromVersion.ts'

const ENTIDADES_PATH = '/cheques/v1.0/entidades'

const DENUNCIADOS_PATH = '/cheques/v1.0/denunciados/{codigoEntidad}/{numeroCheque}'

export async function transform(spec): Promise<any> {
  const entidades = await getEntidades(spec)

  spec.info.version = removeLetterFromVersion(spec.info.version)

  Object.entries(spec.paths).forEach(([path, methods]) => {
    if (path === ENTIDADES_PATH) {
      if (methods.get) {
        methods.get.summary = 'Listado de entidades'
        methods.get.description = 'Listado de entidades que operan con cheques'
        methods.get.tags = []
      }
    }

    if (path === DENUNCIADOS_PATH) {
      transformDenunciados(spec, entidades)
    }
  })

  return spec
}

async function transformDenunciados(spec, entidades) {
  const path = DENUNCIADOS_PATH
  const methods = spec.paths[path]

  if (methods.get) {
    methods.get.summary = 'Consulta de cheque denunciado'
    methods.get.description = 'Consulta de cheque denunciado por entidad y número de cheque'
    methods.get.tags = []
    methods.get.parameters = [
      ...methods.get.parameters.map((param) => {
        if (param.name === 'codigoEntidad') {
          return {
            ...param,
            description: `Código de entidad. Valores posibles: 
${generateEntidadesMarkdown(entidades)}`,
          }
        }

        return param
      }),
    ]
  }

  return spec
}

async function getEntidades(spec) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

  const response = await axios(spec.servers[0].url + ENTIDADES_PATH)

  return response.data.results
}

function generateEntidadesMarkdown(entidades) {
  const markdown = `| Código | Denominación |
| ------ | ------------ |
${entidades.map(entidad => `| ${entidad.codigoEntidad} | ${entidad.denominacion} |`).join('\n')}
    `
  return markdown
}
