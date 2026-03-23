<script setup>
import { defineAsyncComponent, computed } from 'vue'

const props = defineProps({
  operationId: {
    type: String,
    required: true,
  },
})

const LiveMepExamples = defineAsyncComponent(() => import('./OperationExamples/LiveMepExamples.vue'))
const LiveCclExamples = defineAsyncComponent(() => import('./OperationExamples/LiveCclExamples.vue'))
const LiveMarketExamples = defineAsyncComponent(() => import('./OperationExamples/LiveMarketExamples.vue'))
const HistoricalExamples = defineAsyncComponent(() => import('./OperationExamples/HistoricalExamples.vue'))
const VolatilityExamples = defineAsyncComponent(() => import('./OperationExamples/VolatilityExamples.vue'))
const OptionChainExamples = defineAsyncComponent(() => import('./OperationExamples/OptionChainExamples.vue'))

const config = {
  'getLiveMep': { component: LiveMepExamples, props: {} },
  'getLiveCcl': { component: LiveCclExamples, props: {} },
  'getLiveArgStocks': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/arg_stocks' } },
  'getLiveArgOptions': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/arg_options' } },
  'getLiveArgCedears': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/arg_cedears' } },
  'getLiveArgNotes': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/arg_notes' } },
  'getLiveArgCorp': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/arg_corp' } },
  'getLiveArgBonds': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/arg_bonds' } },
  'getLiveUsaAdrs': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/usa_adrs' } },
  'getLiveUsaStocks': { component: LiveMarketExamples, props: { url: 'https://data912.com/live/usa_stocks' } },
  'getHistoricalStocks': { component: HistoricalExamples, props: { urlBase: 'https://data912.com/historical/stocks/', defaultTicker: 'GGAL' } },
  'getHistoricalCedears': { component: HistoricalExamples, props: { urlBase: 'https://data912.com/historical/cedears/', defaultTicker: 'AAPL' } },
  'getHistoricalBonds': { component: HistoricalExamples, props: { urlBase: 'https://data912.com/historical/bonds/', defaultTicker: 'AL30' } },
  'getEodVolatilities': { component: VolatilityExamples, props: {} },
  'getEodOptionChain': { component: OptionChainExamples, props: {} },
}

const current = computed(() => config[props.operationId] || null)
</script>

<template>
  <div v-if="current" class="flex flex-col">
    <h2>Ejemplos de uso</h2>
    <component :is="current.component" v-bind="current.props" />
  </div>
</template>
