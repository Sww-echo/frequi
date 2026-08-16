<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Trade } from '@/types';
defineProps<{ tradeId: Trade['trade_id'] }>();
defineEmits<{
  close: [value: boolean];
}>();
const { t } = useI18n();
</script>

<template>
  <UModal :title="t('trade.customDataFor', { id: tradeId })" description="">
    <template #body>
      <TradeCustomData :trade-id="tradeId" />
    </template>
  </UModal>
</template>
