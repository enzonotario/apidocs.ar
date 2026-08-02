const PUBLIC_PATHS = new Set(['/token', '/healthcheck'])

/** Sidebar titles use `summary` (or `x-sidebar-title` when set). */
const OPERATION_META: Record<string, { summary: string, operationId?: string, sidebarTitle?: string }> = {
  'get /healthcheck': {
    summary: 'Health check',
  },
  'get /api/portafolio': {
    summary: 'Portafolio',
  },
  'get /api/estadocuenta': {
    summary: 'Estado de cuenta',
  },
  'get /api/operaciones/{numero}': {
    summary: 'Detalle de operación',
    operationId: 'MiCuenta_Operacion',
  },
  'delete /api/operaciones/{numero}': {
    summary: 'Cancelar operación',
  },
  'get /api/operaciones': {
    summary: 'Listar operaciones',
  },
  'post /api/operar/Vender': {
    summary: 'Vender',
  },
  'post /api/operar/Comprar': {
    summary: 'Comprar',
  },
  'get /api/{mercado}/Titulos/{simbolo}': {
    summary: 'Datos del título',
  },
  'get /api/{mercado}/Titulos/{simbolo}/Opciones': {
    summary: 'Opciones del título',
  },
  'get /api/{pais}/Titulos/Cotizacion/Instrumentos': {
    summary: 'Instrumentos por país',
    operationId: 'Titulos_InstrumentosPorPais',
  },
  'get /api/Cotizaciones/{Instrumento}/{Panel}/{Pais}': {
    summary: 'Panel de cotizaciones',
  },
  'get /api/{pais}/Titulos/Cotizacion/Paneles/{instrumento}': {
    summary: 'Paneles por instrumento',
    operationId: 'Titulos_PanelesPorInstrumento',
  },
  'get /api/{Mercado}/Titulos/{Simbolo}/Cotizacion': {
    summary: 'Cotización',
  },
  'get /api/{mercado}/Titulos/{simbolo}/Cotizacion/seriehistorica/{fechaDesde}/{fechaHasta}/{ajustada}': {
    summary: 'Serie histórica',
  },
  'post /token': {
    summary: 'Obtener token',
  },
}

export function transform(spec) {
  spec.info = {
    ...spec.info,
    title: 'IOL',
    version: spec.info?.version ?? 'v1',
    description: 'API v1 de InvertirOnline (IOL): autenticación, cuenta, títulos y operaciones.',
  }

  spec.servers = [
    {
      url: 'https://api.invertironline.com',
      description: 'Producción',
    },
  ]

  spec.components ??= {}
  spec.components.securitySchemes = {
    ...spec.components.securitySchemes,
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  }

  // OAuth token endpoint accepts form-urlencoded in practice.
  const tokenPost = spec.paths?.['/token']?.post
  if (tokenPost?.requestBody?.content) {
    const schema = tokenPost.requestBody.content['application/x-www-form-urlencoded']?.schema
      ?? tokenPost.requestBody.content['application/json']?.schema
      ?? { $ref: '#/components/schemas/TokenRequest' }

    tokenPost.requestBody = {
      required: true,
      content: {
        'application/x-www-form-urlencoded': {
          schema,
          examples: {
            'Obtener Token': {
              value: {
                username: 'usuario',
                password: 'contraseña',
                grant_type: 'password',
              },
            },
            'Refresh Token': {
              value: {
                refresh_token: 'tu_refresh_token',
                grant_type: 'refresh_token',
              },
            },
          },
        },
      },
    }
    tokenPost.security = []
  }

  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
      if (method.startsWith('x-') || !operation || typeof operation !== 'object') {
        continue
      }

      const meta = OPERATION_META[`${method} ${path}`]
      if (meta) {
        operation.summary = meta.summary
        if (meta.operationId) {
          operation.operationId = meta.operationId
        }
        if (meta.sidebarTitle) {
          operation['x-sidebar-title'] = meta.sidebarTitle
        }
      }

      if (Array.isArray(operation.parameters)) {
        operation.parameters = normalizeParameters(path, operation.parameters)
      }

      if (PUBLIC_PATHS.has(path)) {
        operation.security = []
      }
      else if (!operation.security) {
        operation.security = [{ bearerAuth: [] }]
      }
    }
  }

  return spec
}

/**
 * ASP.NET Swagger exports nested FromUri models as `prefix.field` query params
 * (e.g. panelCotizacion.instrumento) that often duplicate path params.
 * Flatten names and drop query params that already exist as path placeholders.
 */
function normalizeParameters(path: string, parameters: any[]) {
  const placeholders = [...path.matchAll(/\{([^}]+)\}/g)].map(match => match[1])
  const placeholderByLower = new Map(
    placeholders.map(name => [name.toLowerCase(), name]),
  )

  const pathEnrichments = new Map<string, any>()
  const remaining: any[] = []

  for (const param of parameters) {
    if (!param || typeof param !== 'object') {
      continue
    }

    const originalName = String(param.name ?? '')
    const fieldName = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.') + 1)
      : originalName
    const matchingPath = placeholderByLower.get(fieldName.toLowerCase())

    if (param.in === 'query' && matchingPath) {
      pathEnrichments.set(matchingPath.toLowerCase(), param)
      continue
    }

    if (param.in === 'query' && originalName.includes('.')) {
      const prefix = originalName.slice(0, originalName.indexOf('.'))

      // IOL binds operaciones filters as filtro.estado, filtro.pais, etc.
      if (prefix === 'filtro') {
        remaining.push(param)
        continue
      }

      remaining.push({
        ...param,
        name: fieldName,
      })
      continue
    }

    remaining.push(param)
  }

  const pathParams: any[] = []
  for (const placeholder of placeholders) {
    const existing = remaining.find(
      param => param.in === 'path' && String(param.name).toLowerCase() === placeholder.toLowerCase(),
    )
    const enrichment = pathEnrichments.get(placeholder.toLowerCase())

    if (existing) {
      existing.name = placeholder
      if (enrichment?.schema) {
        existing.schema = {
          ...(existing.schema ?? {}),
          ...enrichment.schema,
        }
      }
      if (enrichment?.description && !existing.description) {
        existing.description = enrichment.description
      }
      pathParams.push(existing)
      continue
    }

    pathParams.push({
      name: placeholder,
      in: 'path',
      required: true,
      description: enrichment?.description,
      schema: enrichment?.schema ?? { type: 'string' },
    })
  }

  const nonPath = remaining.filter(param => param.in !== 'path')

  return [...pathParams, ...nonPath]
}
