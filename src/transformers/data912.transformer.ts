export async function transform(spec: any): Promise<any> {
  // Translate global info
  spec.info.title = 'Data912'
  spec.info.description = 'API con fines educativos que proporciona datos financieros, precios en vivo y análisis de riesgo. Los datos no son en tiempo real y cualquier parecido con los mercados reales es coincidencia.'

  // 1. Refactor /live/mep
  if (spec.paths['/live/mep']?.get) {
    const op = spec.paths['/live/mep'].get
    op.summary = 'Dólar MEP en vivo'
    op.description = 'Precios en vivo para el dólar MEP (Mercado Electrónico de Pagos).'
    op.responses['200'].content = {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ticker: { type: 'string', description: 'Símbolo del activo' },
              bid: { type: 'number', description: 'Precio de compra (bid)' },
              ask: { type: 'number', description: 'Precio de venta (ask)' },
              close: { type: 'number', description: 'Último precio de cierre' },
              mark: { type: 'number', description: 'Precio promedio (mark)' },
              v_ars: { type: 'number', description: 'Volumen operado en ARS' },
              v_usd: { type: 'number', description: 'Volumen operado en USD' },
              q_ars: { type: 'number', description: 'Cantidad de operaciones en ARS' },
              q_usd: { type: 'number', description: 'Cantidad de operaciones en USD' },
              ars_bid: { type: 'number', description: 'Precio bid en ARS' },
              ars_ask: { type: 'number', description: 'Precio ask en ARS' },
              usd_bid: { type: 'number', description: 'Precio bid en USD' },
              usd_ask: { type: 'number', description: 'Precio ask en USD' },
              panel: { type: 'string', description: 'Panel de cotización' }
            }
          }
        }
      }
    }
  }

  // 2. Refactor /live/ccl
  if (spec.paths['/live/ccl']?.get) {
    const op = spec.paths['/live/ccl'].get
    op.summary = 'Dólar CCL en vivo'
    op.description = 'Precios en vivo para el dólar CCL (Contado con Liquidación).'
    op.responses['200'].content = {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ticker_usa: { type: 'string', description: 'Símbolo del activo en USA' },
              ticker_ar: { type: 'string', description: 'Símbolo del activo en Argentina' },
              CCL_bid: { type: 'number', description: 'Precio bid del CCL' },
              CCL_ask: { type: 'number', description: 'Precio ask del CCL' },
              CCL_close: { type: 'number', description: 'Precio de cierre del CCL' },
              CCL_mark: { type: 'number', description: 'Precio promedio del CCL' },
              ars_volume: { type: 'number', description: 'Volumen operado en ARS' },
              volume_rank: { type: 'number', description: 'Ranking por volumen' },
              arg_panel: { type: 'string', description: 'Panel en Argentina' },
              usa_panel: { type: 'string', description: 'Panel en USA' }
            }
          }
        }
      }
    }
  }

  // 3. Common refactor for other /live/ endpoints
  const liveMappings = {
    '/live/arg_stocks': { summary: 'Acciones Argentinas', description: 'Precios en vivo de acciones del mercado argentino (BYMA).' },
    '/live/arg_options': { summary: 'Opciones Argentinas', description: 'Precios en vivo de cadenas de opciones del mercado argentino.' },
    '/live/arg_cedears': { summary: 'CEDEARs', description: 'Precios en vivo de Certificados de Depósito Argentinos.' },
    '/live/arg_notes': { summary: 'Letras del Tesoro', description: 'Precios en vivo de letras y notas del tesoro argentino.' },
    '/live/arg_corp': { summary: 'Obligaciones Negociables', description: 'Precios en vivo de deuda corporativa argentina.' },
    '/live/arg_bonds': { summary: 'Bonos Argentinos', description: 'Precios en vivo de bonos gubernamentales argentinos.' },
    '/live/usa_adrs': { summary: 'ADRs Argentinos en USA', description: 'Precios en vivo de ADRs de empresas argentinas que cotizan en USA.' },
    '/live/usa_stocks': { summary: 'Acciones USA', description: 'Precios en vivo de acciones del mercado de Estados Unidos.' }
  }

  Object.entries(liveMappings).forEach(([path, info]) => {
    if (spec.paths[path]?.get) {
      const op = spec.paths[path].get
      op.summary = info.summary
      op.description = info.description
      op.responses['200'].content = {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string', description: 'Símbolo del activo' },
                c: { type: 'number', description: 'Precio actual' },
                v: { type: 'number', description: 'Volumen operado' },
                q_bid: { type: 'number', description: 'Cantidad bid' },
                px_bid: { type: 'number', description: 'Precio bid' },
                px_ask: { type: 'number', description: 'Precio ask' },
                q_ask: { type: 'number', description: 'Cantidad ask' },
                q_op: { type: 'number', description: 'Cantidad de operaciones diarias' },
                pct_change: { type: 'number', description: 'Cambio porcentual diario' }
              }
            }
          }
        }
      }
    }
  })

  // 4. Historical endpoints
  const historicalMappings = {
    '/historical/stocks/{ticker}': { summary: 'Histórico de Acciones AR', description: 'Datos históricos OHLCV de acciones argentinas.' },
    '/historical/cedears/{ticker}': { summary: 'Histórico de CEDEARs', description: 'Datos históricos OHLCV de CEDEARs.' },
    '/historical/bonds/{ticker}': { summary: 'Histórico de Bonos AR', description: 'Datos históricos OHLCV de bonos argentinos.' }
  }

  Object.entries(historicalMappings).forEach(([path, info]) => {
    if (spec.paths[path]?.get) {
      const op = spec.paths[path].get
      op.summary = info.summary
      op.description = info.description
      op.responses['200'].content = {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/HistoricalBar'
            }
          }
        }
      }
    }
  })

  // 5. Volatilities
  if (spec.paths['/eod/volatilities/{ticker}']?.get) {
    const op = spec.paths['/eod/volatilities/{ticker}'].get
    op.summary = 'Análisis de Riesgo y Volatilidad'
    op.description = 'Métricas de volatilidad implícita e histórica para activos de USA.'
    op.responses['200'].content = {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/VolatilityMetrics'
        }
      }
    }
  }

  // 6. Option Chain
  if (spec.paths['/eod/option_chain/{ticker}']?.get) {
    const op = spec.paths['/eod/option_chain/{ticker}'].get
    op.summary = 'Cadena de Opciones (USA)'
    op.description = 'Datos de cierre (EOD) para cadenas de opciones del mercado estadounidense.'
    op.responses['200'].content = {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              opex: { type: 'string', description: 'Fecha de expiración' },
              s_symbol: { type: 'string', description: 'Símbolo del subyacente' },
              type: { type: 'string', description: 'Tipo (call/put)' },
              k: { type: 'number', description: 'Precio de ejercicio (strike)' },
              oi: { type: 'number', description: 'Interés abierto (open interest)' },
              c: { type: 'number', description: 'Precio de cierre' },
              iv: { type: 'number', description: 'Volatilidad implícita' },
              ask: { type: 'number', description: 'Precio ask' },
              bid: { type: 'number', description: 'Precio bid' },
              delta: { type: 'number', description: 'Griegas: Delta' },
              gamma: { type: 'number', description: 'Griegas: Gamma' },
              rho: { type: 'number', description: 'Griegas: Rho' },
              theta: { type: 'number', description: 'Griegas: Theta' },
              vega: { type: 'number', description: 'Griegas: Vega' },
              fair_value: { type: 'number', description: 'Valor teórico justo' },
              itm_prob: { type: 'number', description: 'Probabilidad de estar in-the-money' },
              otm: { type: 'number', description: 'Valor fuera del dinero' },
              intrinsic: { type: 'number', description: 'Valor intrínseco' },
              fair_iv: { type: 'number', description: 'Volatilidad implícita justa' },
              r_days: { type: 'number', description: 'Días restantes' },
              r_tdays: { type: 'number', description: 'Días hábiles restantes' },
              hv_2m: { type: 'number', description: 'Volatilidad histórica (2 meses)' },
              hv_1yr: { type: 'number', description: 'Volatilidad histórica (1 año)' }
            }
          }
        }
      }
    }
  }

  // 7. Improve operationIds
  const operationIdMap: Record<string, string> = {
    '__USD_MEP_live_mep_get': 'getLiveMep',
    '__USD_CCL_live_ccl_get': 'getLiveCcl',
    '___arg_stocks_live_arg_stocks_get': 'getLiveArgStocks',
    '___option_chains___live_arg_options_get': 'getLiveArgOptions',
    '___cedears__live_arg_cedears_get': 'getLiveArgCedears',
    '___gov_notes__live_arg_notes_get': 'getLiveArgNotes',
    '___corporate_debt___live_arg_corp_get': 'getLiveArgCorp',
    '___gov_bonds__live_arg_bonds_get': 'getLiveArgBonds',
    '___ADRs_live_usa_adrs_get': 'getLiveUsaAdrs',
    '___usa_stocks_live_usa_stocks_get': 'getLiveUsaStocks',
    '___arg_stocks_OHLC_historical_stocks__ticker__get': 'getHistoricalStocks',
    '___cedears_OHLC_historical_cedears__ticker__get': 'getHistoricalCedears',
    '___arg_bonds_OHLC_historical_bonds__ticker__get': 'getHistoricalBonds',
    '___USA_Stocks_Risk_Analytics_eod_volatilities__ticker__get': 'getEodVolatilities',
    '___USA_option_chains_eod_option_chain__ticker__get': 'getEodOptionChain',
    'contact_contact_post': 'postContact',
  }

  for (const pathItem of Object.values(spec.paths) as any[]) {
    for (const op of Object.values(pathItem) as any[]) {
      if (op.operationId && operationIdMap[op.operationId]) {
        op.operationId = operationIdMap[op.operationId]
      }
    }
  }

  // Translate parameter titles and descriptions
  spec.components.schemas.HistoricalBar.title = 'Barra Histórica'
  Object.values(spec.components.schemas.HistoricalBar.properties).forEach((prop: any) => {
    if (prop.title === 'Date') prop.title = 'Fecha'
  })

  return spec
}
