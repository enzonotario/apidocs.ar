export function transform(spec) {
  Object.entries(spec.paths).forEach(([path, methods]) => {
    if (path === '/centraldedeudores/v1.0/Deudas/{Identificacion}') {
      if (methods.get) {
        methods.get.summary = 'Deudas por Identificación'
        methods.get.description = 'Obtener deudas de una persona por Identificación'
      }
    }

    if (path === '/centraldedeudores/v1.0/Deudas/Historicas/{Identificacion}') {
      if (methods.get) {
        methods.get.summary = 'Deudas históricas por Identificación'
        methods.get.description = 'Obtener deudas históricas de una persona por Identificación'
      }
    }

    if (path === '/centraldedeudores/v1.0/Deudas/ChequesRechazados/{Identificacion}') {
      if (methods.get) {
        methods.get.summary = 'Cheques rechazados por Identificación'
        methods.get.description = 'Obtener cheques rechazados de una persona por Identificación'
      }
    }
  })

  return spec
}
