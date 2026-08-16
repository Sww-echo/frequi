<script setup lang="ts">
import { MarginMode, TradingMode } from '@/types';
import type { ExchangeSelection, Markets, MarketsPayload, PairHistoryPayload } from '@/types';

const botStore = useBotStore();
const chartStore = useChartConfigStore();

const currentStrategy = computed(
  () => botStore.activeBot.botState?.strategy || botStore.activeBot.strategy?.strategy || '',
);
const chartStrategy = computed(() =>
  botStore.activeBot.isWebserverMode
    ? chartStore.strategy || currentStrategy.value
    : currentStrategy.value,
);
const selectedProfile = computed(() =>
  botStore.activeBot.strategyProfiles.find((profile) => profile.strategy === chartStrategy.value),
);
const allowedTimeframes = computed(() => selectedProfile.value?.timeframes || []);
const finalTimeframe = computed<string>(() =>
  botStore.activeBot.isWebserverMode
    ? chartStore.selectedTimeframe ||
      selectedProfile.value?.default_timeframe ||
      botStore.activeBot.timeframe
    : botStore.activeBot.timeframe,
);
const chartUsesHistory = computed(() => botStore.activeBot.isWebserverMode);

const availablePairs = computed<string[]>(() => {
  if (botStore.activeBot.isWebserverMode) {
    if (chartStore.useLiveData) {
      return Object.keys(markets.value?.markets || {}).sort() || [];
    }
    if (finalTimeframe.value && finalTimeframe.value !== '') {
      const tf = finalTimeframe.value;
      return botStore.activeBot.pairlistWithTimeframe
        .filter(([_, timeframe]) => timeframe === tf)
        .map(([pair]) => pair);
    }
    return botStore.activeBot.pairlist;
  }
  return botStore.activeBot.whitelist;
});

onMounted(async () => {
  if (botStore.activeBot.strategyProfiles.length === 0) {
    await botStore.activeBot.getStrategyProfiles();
  }
  if (!chartStore.strategy && currentStrategy.value) {
    chartStore.strategy = currentStrategy.value;
  }
  if (botStore.activeBot.isWebserverMode) {
    botStore.activeBot.getAvailablePairs({});
  } else if (!botStore.activeBot.whitelist || botStore.activeBot.whitelist.length === 0) {
    botStore.activeBot.getWhitelist();
  }
});

function refreshOHLCV(pair: string, columns: string[]) {
  const payload: PairHistoryPayload = {
    pair,
    timeframe: finalTimeframe.value,
    timerange: chartStore.timerange,
    strategy: chartStrategy.value,
    columns,
    live_mode: chartStore.useLiveData,
  };
  if (exchange.value.customExchange) {
    payload.exchange = exchange.value.selectedExchange.exchange;
    payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
    payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
  }
  if (botStore.activeBot.isWebserverMode) {
    botStore.activeBot.getChartHistory(payload);
  } else {
    botStore.activeBot.getPairCandles({ pair, timeframe: finalTimeframe.value, columns });
  }
}
const exchange = ref<{
  customExchange: boolean;
  selectedExchange: ExchangeSelection;
}>({
  customExchange: false,
  selectedExchange: {
    exchange: botStore.activeBot.botState.exchange,
    trade_mode: {
      margin_mode: MarginMode.NONE,
      trading_mode: TradingMode.SPOT,
    },
  },
});

const markets = ref<Markets | null>(null);
watch(
  () => chartStore.useLiveData,
  async () => {
    if (botStore.activeBot.isWebserverMode && chartStore.useLiveData) {
      const payload: MarketsPayload = {};
      if (exchange.value.customExchange) {
        payload.exchange = exchange.value.selectedExchange.exchange;
        payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
        payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
      }
      markets.value = await botStore.activeBot.getMarkets(payload);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="md:mx-3 mt-2 px-1">
      <UCard :ui="{ body: 'p-3 sm:p-3' }">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl font-bold">{{ $t('chart.settings') }}</span>
          <InfoBox :hint="$t('chart.settingsHint')" />
        </div>
        <div
          class="mb-2 border dark:border-neutral-700 border-neutral-300 rounded-md p-2 text-start"
        >
          <UCollapsible v-model:open="exchange.customExchange">
            <div class="flex flex-row gap-5 items-center">
              <BaseCheckbox v-model="exchange.customExchange">{{
                $t('chart.customExchange')
              }}</BaseCheckbox>
              <span v-show="!exchange.customExchange" class="text-sm">
                {{ $t('chart.currentExchange') }}
                {{ botStore.activeBot.botState.exchange }}
                {{ botStore.activeBot.botState.trading_mode }}
              </span>
            </div>
            <template #content>
              <ExchangeSelect v-model="exchange.selectedExchange" class="mt-2" />
            </template>
          </UCollapsible>
          <Transition name="fade"> </Transition>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-5 mx-1 gap-1 md:gap-2">
          <div class="text-start md:me-1 col-span-2">
            <span>{{ $t('chart.strategy') }}</span>
            <StrategySelect
              v-model="chartStore.strategy"
              :approved-only="true"
              :disabled="!botStore.activeBot.isWebserverMode"
              class="mt-1 mb-1"
            ></StrategySelect>
            <BaseCheckbox
              v-if="
                botStore.activeBot.isWebserverMode && botStore.activeBot.botFeatures.chartLiveData
              "
              v-model="chartStore.useLiveData"
              class="align-self-center"
              :title="$t('chart.liveDataHint')"
            >
              {{ $t('chart.liveData') }}
            </BaseCheckbox>
          </div>
          <div class="flex flex-col text-start">
            <span>{{ $t('chart.timeframe') }}</span>
            <TimeframeSelect
              v-model="chartStore.selectedTimeframe"
              :allowed-timeframes="allowedTimeframes"
              :disabled="!botStore.activeBot.isWebserverMode"
              class="mt-1"
            />
          </div>
          <TimeRangeSelect
            v-model="chartStore.timerange"
            class="col-span-3 md:col-span-2"
          ></TimeRangeSelect>
        </div>
      </UCard>
    </div>

    <div class="md:mx-2 mt-2 pb-1 h-full">
      <CandleChartContainer
        :available-pairs="availablePairs"
        :historic-view="chartUsesHistory"
        :timeframe="finalTimeframe"
        :trades="botStore.activeBot.allTrades"
        :timerange="chartUsesHistory ? chartStore.timerange : undefined"
        :strategy="chartUsesHistory ? chartStrategy : undefined"
        @refresh-data="refreshOHLCV"
      >
      </CandleChartContainer>
    </div>
  </div>
</template>
