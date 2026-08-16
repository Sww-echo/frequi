<script setup lang="ts">
import type { Trade } from '@/types';

type modes = 'default' | 'total' | 'realized';

const props = withDefaults(
  defineProps<{
    trade: Trade;
    mode?: modes;
  }>(),
  {
    mode: 'default',
  },
);

const { t } = useI18n();

const modeDescKeys: { [key in modes]: string } = {
  default: 'trade.currentProfit',
  total: 'trade.totalProfit',
  realized: 'trade.realizedProfit',
};

const profitRatio = computed<number | undefined | null>(() => {
  switch (props.mode) {
    case 'default':
      return props.trade.profit_ratio;
    case 'total':
      return props.trade.total_profit_ratio;
    case 'realized':
      return props.trade.realized_profit_ratio;
    default:
      return undefined;
  }
});
const profitAbs = computed<number | undefined>(() => {
  switch (props.mode) {
    case 'default':
      return props.trade.profit_abs;
    case 'total':
      return props.trade.total_profit_abs;
    case 'realized':
      return props.trade.realized_profit;
    default:
      return undefined;
  }
});
const profitDesc = computed((): string => {
  let profit = `${t(modeDescKeys[props.mode])}: ${
    profitRatio.value ? formatPercent(profitRatio.value) : ''
  } (${profitAbs.value})`;
  profit += `\n${t('trade.openSince')}: ${timestampms(props.trade.open_timestamp)}`;
  return profit;
});
</script>

<template>
  <ProfitPill
    :profit-ratio="profitRatio"
    :profit-abs="profitAbs"
    :profit-desc="profitDesc"
    :stake-currency="trade.quote_currency || 'USDT'"
  />
</template>
