<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { LookaheadResult } from '@/types';

const props = defineProps<{
  result: LookaheadResult;
}>();
const { t } = useI18n();

const tableColumns = computed(() => [
  { accessorKey: 'strategy', header: t('analysis.strategy'), meta: { class: { td: 'font-mono' } } },
  { accessorKey: 'has_bias', header: t('analysis.hasBias') },
  { accessorKey: 'total_signals', header: t('analysis.totalSignals') },
  { accessorKey: 'biased_entry_signals', header: t('analysis.biasedEntrySignals') },
  { accessorKey: 'biased_exit_signals', header: t('analysis.biasedExitSignals') },
  { accessorKey: 'biased_indicators', header: t('analysis.biasedIndicators') },
]);

const tableData = computed(() => [
  {
    strategy: props.result.strategy,
    has_bias: props.result.has_bias,
    total_signals: props.result.total_signals,
    biased_entry_signals: props.result.biased_entry_signals,
    biased_exit_signals: props.result.biased_exit_signals,
    biased_indicators: props.result.biased_indicators ?? [],
  },
]);
</script>

<template>
  <div class="flex flex-col gap-3">
    <UAlert
      v-if="!result.has_bias"
      color="success"
      class="py-2"
      icon="i-mdi-check-circle"
      :title="$t('analysis.noBiasTitle')"
      :description="$t('analysis.noBiasDescription')"
    />
    <UAlert
      v-else
      color="error"
      class="py-2"
      icon="i-mdi-alert"
      :title="$t('analysis.biasTitle')"
      :description="$t('analysis.biasDescription')"
    />

    <div>
      <UTable :data="tableData" :columns="tableColumns">
        <template #has_bias-cell="{ row }">
          <UBadge :color="row.original.has_bias ? 'error' : 'success'" variant="subtle">
            {{ row.original.has_bias ? $t('analysis.yes') : $t('analysis.no') }}
          </UBadge>
        </template>
        <template #biased_indicators-cell="{ row }">
          <div v-if="row.original.biased_indicators.length > 0" class="flex flex-wrap gap-1">
            <UBadge
              v-for="ind in row.original.biased_indicators"
              :key="ind"
              color="warning"
              variant="subtle"
            >
              {{ ind }}
            </UBadge>
          </div>
          <span v-else class="text-neutral-500">-</span>
        </template>
      </UTable>
    </div>
  </div>
</template>
