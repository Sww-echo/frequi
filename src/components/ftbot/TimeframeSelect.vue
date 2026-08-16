<script setup lang="ts">
interface Props {
  belowTimeframe?: string;
  size?: undefined | 'sm' | 'md' | 'lg' | 'xl';
  allowedTimeframes?: string[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  belowTimeframe: '',
  size: undefined,
  allowedTimeframes: undefined,
  disabled: false,
});
const selectedTimeframe = defineModel<string>({ default: '' });
const { t } = useI18n();

// The below list must always remain sorted correctly!
const availableTimeframesBase = [
  // Placeholder value
  { value: null, label: t('backtest.useStrategyDefault') },
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '2h', label: '2h' },
  { value: '4h', label: '4h' },
  { value: '6h', label: '6h' },
  { value: '8h', label: '8h' },
  { value: '12h', label: '12h' },
  { value: '1d', label: '1d' },
  { value: '3d', label: '3d' },
  { value: '1w', label: '1w' },
  { value: '2w', label: '2w' },
  { value: '1M', label: '1M' },
  { value: '1y', label: '1y' },
];

const availableTimeframes = computed(() => {
  let values = availableTimeframesBase;
  if (props.belowTimeframe) {
    const idx = availableTimeframesBase.findIndex((v) => v.value === props.belowTimeframe);
    values = [...availableTimeframesBase].splice(0, idx);
  }
  if (!props.allowedTimeframes?.length) return values;
  return values.filter(
    (item) => item.value === null || props.allowedTimeframes?.includes(item.value),
  );
});
</script>

<template>
  <USelect
    v-model="selectedTimeframe"
    :placeholder="$t('backtest.useStrategyDefault')"
    :size="size"
    :items="availableTimeframes"
    :disabled="props.disabled"
  ></USelect>
</template>
