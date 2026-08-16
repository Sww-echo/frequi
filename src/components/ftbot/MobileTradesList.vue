<script setup lang="ts">
defineProps<{
  history?: boolean;
}>();
const botStore = useBotStore();
</script>

<template>
  <div>
    <!-- <TradeList
      class="open-trades"
      :trades="openTrades"
      :title="$t('trade.openTrades')"
      :active-trades="true"
      :empty-text="$t('trade.currentlyNoOpenTrades')"
    /> -->
    <CustomTradeList
      v-if="!history && !botStore.activeBot.detailTradeId"
      :trades="botStore.activeBot.openTrades"
      :title="$t('trade.openTrades')"
      :active-trades="true"
      :stake-currency-decimals="botStore.activeBot.stakeCurrencyDecimals"
      :empty-text="$t('trade.noOpenTrades')"
    />
    <CustomTradeList
      v-if="history && !botStore.activeBot.detailTradeId"
      :trades="botStore.activeBot.closedTrades"
      :title="$t('trade.history')"
      :stake-currency-decimals="botStore.activeBot.stakeCurrencyDecimals"
      :empty-text="$t('trade.noClosedTrades')"
    />
    <div
      v-if="botStore.activeBot.detailTradeId && botStore.activeBot.tradeDetail"
      class="flex flex-col"
    >
      <UButton
        color="neutral"
        class="self-start my-1 ms-1"
        @click="botStore.activeBot.setDetailTrade(null)"
        :label="$t('common.back')"
        icon="mdi:arrow-left"
      />
      <TradeDetail
        :trade="botStore.activeBot.tradeDetail"
        :stake-currency="botStore.activeBot.stakeCurrency"
      />
    </div>
  </div>
</template>
