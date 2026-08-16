<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const botStore = useBotStore();
const { t } = useI18n();
const { confirm } = useConfirmBox();
const leverage = ref(1);
const savingLeverage = ref(false);
const shortEnabled = ref(true);

const isFutures = computed(() => botStore.activeBot.botState?.trading_mode === 'futures');

watch(
  () => botStore.activeBot.botState?.leverage,
  (value) => {
    leverage.value = value ?? 1;
  },
  { immediate: true },
);

watch(
  () => botStore.activeBot.botState?.short_enabled,
  (value) => {
    shortEnabled.value = value ?? true;
  },
  { immediate: true },
);

async function toggleShortEnabled() {
  const nextValue = !shortEnabled.value;
  if (
    !(await confirm({
      title: t('controls.shortEnabledTitle'),
      message: t('controls.shortEnabledMessage'),
    }))
  ) {
    return;
  }
  await botStore.activeBot.setShortEnabled(nextValue);
}

async function applyLeverage() {
  const value = Number(leverage.value);
  if (!Number.isFinite(value) || value < 1) {
    showAlert(t('controls.leverageInvalid'), 'error');
    return;
  }
  if (
    !(await confirm({
      title: t('controls.leverageTitle'),
      message: t('controls.leverageMessage'),
    }))
  ) {
    return;
  }
  savingLeverage.value = true;
  try {
    await botStore.activeBot.setLeverage(value);
  } finally {
    savingLeverage.value = false;
  }
}
</script>

<template>
  <div v-if="botStore.activeBot.botState" class="p-4">
    <p class="mb-4">
      {{ $t('status.running') }} <strong>{{ botStore.activeBot.version }}</strong>
    </p>
    <p class="mb-4">
      {{ $t('status.runningWith') }}
      <strong>
        {{ botStore.activeBot.botState.max_open_trades }}x{{
          botStore.activeBot.botState.stake_amount
        }}
        {{ botStore.activeBot.botState.stake_currency }}
      </strong>
      {{ $t('status.on') }}
      <strong class="text-nowrap"
        >{{ botStore.activeBot.botState.exchange }}
        {{ botStore.activeBot.botState.demo_trading ? '(Demo)' : '' }}</strong
      >
      {{ $t('common.in') }}
      <strong
        >{{ botStore.activeBot.botState.trading_mode || 'spot' }}
        {{
          botStore.activeBot.botState.trading_mode !== 'spot'
            ? (botStore.activeBot.botState.margin_mode ?? '')
            : ''
        }}</strong
      >
      {{ $t('status.marketsWithStrategy') }}
      <strong>{{ botStore.activeBot.botState.strategy }}</strong
      >。
    </p>
    <div v-if="isFutures" class="mb-4 rounded border border-neutral-400 p-3 space-y-2">
      <div class="flex flex-wrap items-end gap-2">
        <UFormField :label="t('controls.leverageLabel')">
          <UInputNumber
            v-model="leverage"
            :min="1"
            :max="125"
            :step="0.5"
            :max-fraction-digits="1"
            class="w-36"
          />
        </UFormField>
        <UButton :loading="savingLeverage" @click="applyLeverage">
          {{ t('controls.leverageApply') }}
        </UButton>
      </div>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {{ t('controls.leverageHint') }}
      </p>
      <UButton color="neutral" variant="outline" @click="toggleShortEnabled">
        {{ t('controls.shortEnabledLabel') }}:
        {{ shortEnabled ? t('controls.shortEnabledOn') : t('controls.shortEnabledOff') }}
      </UButton>
    </div>
    <StrategyRuntimeSettings />
    <p v-if="'stoploss_on_exchange' in botStore.activeBot.botState" class="mb-4">
      {{ $t('status.stoplossExchange') }}
      <strong>{{
        botStore.activeBot.botState.stoploss_on_exchange
          ? $t('status.enabled')
          : $t('status.disabled')
      }}</strong
      >.
    </p>
    <p class="mb-4">
      {{ $t('status.currently') }} <strong>{{ botStore.activeBot.botState.state }}</strong
      >,
      <strong
        >{{ $t('status.forceEntry') }}: {{ botStore.activeBot.botState.force_entry_enable }}</strong
      >
    </p>
    <p>
      <strong>{{
        botStore.activeBot.botState.dry_run ? $t('status.dryRun') : $t('status.live')
      }}</strong>
    </p>
    <USeparator class="my-2" />
    <p class="mb-4" v-if="botStore.activeBot.profit">
      {{ $t('status.avgProfit') }}
      {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_mean) }} (&sum;
      {{ formatPercent(botStore.activeBot.profit.profit_all_ratio_sum) }}) {{ $t('common.in') }}
      {{ botStore.activeBot.profit.trade_count }} {{ $t('status.trades') }}，{{
        $t('status.averageDuration')
      }}
      {{ botStore.activeBot.profit.avg_duration }}。{{ $t('status.bestPair') }}：
      {{ botStore.activeBot.profit.best_pair }}.
    </p>
    <p v-if="botStore.activeBot.profit?.first_trade_timestamp" class="mb-4">
      <span v-if="botStore.activeBot.profit.bot_start_timestamp" class="block">
        {{ $t('status.botStart') }}
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.bot_start_timestamp" show-timezone />
        </strong>
      </span>
      <span class="block">
        {{ $t('status.firstTrade') }}
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.first_trade_timestamp" show-timezone />
        </strong>
      </span>
      <span class="block">
        {{ $t('status.lastTrade') }}
        <strong>
          <DateTimeTZ :date="botStore.activeBot.profit.latest_trade_timestamp" show-timezone />
        </strong>
      </span>
    </p>
    <p>
      <span v-if="botStore.activeBot.profit?.profit_factor" class="block">
        {{ $t('status.profitFactor') }}
        {{ formatNumber(botStore.activeBot.profit?.profit_factor, 2) }}
      </span>
      <span v-if="botStore.activeBot.profit?.trading_volume" class="block mb-4">
        {{ $t('status.tradingVolume') }}
        {{
          formatPriceCurrency(
            botStore.activeBot.profit.trading_volume,
            botStore.activeBot.botState.stake_currency,
            botStore.activeBot.botState.stake_currency_decimals ?? 3,
          )
        }}
      </span>
    </p>
    <BaseCollapsible
      v-if="botStore.activeBot.strategy?.params"
      :title="$t('status.strategyParameters')"
    >
      <StrategyParameters :strategy="botStore.activeBot.strategy" class="m-3" />
    </BaseCollapsible>
    <USeparator class="my-5" />
    <BotProfit
      class="mx-1"
      v-if="botStore.activeBot.profitAll"
      :profit-all="botStore.activeBot.profitAll"
      :stake-currency="botStore.activeBot.botState.stake_currency ?? 'USDT'"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
  </div>
</template>
