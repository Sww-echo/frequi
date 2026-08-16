<script setup lang="ts">
import type { StrategyProfilePayload, StrategyProfilePreview } from '@/types';

const botStore = useBotStore();
const { t } = useI18n();
const { confirm } = useConfirmBox();

const profileId = ref('');
const selectedTimeframe = ref('');
const leverage = ref<number | undefined>(undefined);
const shortEnabled = ref(true);
const preview = ref<StrategyProfilePreview | null>(null);
const loading = ref(false);
const applying = ref(false);

const profiles = computed(() =>
  botStore.activeBot.strategyProfiles.filter((profile) => profile.compatible),
);
const selectedProfile = computed(() =>
  profiles.value.find((profile) => profile.id === profileId.value),
);
const profileItems = computed(() =>
  profiles.value.map((profile) => ({ label: profile.display_name, value: profile.id })),
);
const canUseLeverage = computed(() => selectedProfile.value?.leverage_allowed === true);
const canUseShort = computed(() => selectedProfile.value?.supports_short === true);
const canApply = computed(
  () =>
    Boolean(selectedProfile.value) &&
    Boolean(botStore.activeBot.runtimeSettings) &&
    botStore.activeBot.runtimeSettings?.can_apply === true &&
    botStore.activeBot.openTradeCount === 0,
);

function syncForm() {
  const current = botStore.activeBot.runtimeSettings;
  if (current?.profile_id && profiles.value.some((profile) => profile.id === current.profile_id)) {
    profileId.value = current.profile_id;
  } else if (current?.strategy) {
    profileId.value =
      profiles.value.find((profile) => profile.strategy === current.strategy)?.id || '';
    if (!profileId.value && profiles.value[0]) profileId.value = profiles.value[0].id;
  } else if (!profileId.value && profiles.value[0]) {
    profileId.value = profiles.value[0].id;
  }
  if (current?.timeframe) selectedTimeframe.value = current.timeframe;
  leverage.value = current?.leverage ?? undefined;
  shortEnabled.value = current?.short_enabled ?? selectedProfile.value?.supports_short ?? false;
}

watch([selectedTimeframe, leverage, shortEnabled], () => {
  preview.value = null;
});

watch(
  () => profileId.value,
  () => {
    const profile = selectedProfile.value;
    if (!profile) return;
    if (!profile.runtime_timeframes.includes(selectedTimeframe.value)) {
      selectedTimeframe.value = profile.default_timeframe;
    }
    if (!profile.leverage_allowed) leverage.value = undefined;
    if (!profile.supports_short) shortEnabled.value = false;
    preview.value = null;
  },
);

onMounted(async () => {
  await Promise.all([
    botStore.activeBot.getStrategyProfiles(),
    botStore.activeBot.getRuntimeSettings(),
  ]);
  syncForm();
});

function buildPayload(): StrategyProfilePayload {
  const payload: StrategyProfilePayload = {
    profile_id: profileId.value,
    timeframe: selectedTimeframe.value,
    short_enabled: canUseShort.value ? shortEnabled.value : false,
  };
  if (canUseLeverage.value && leverage.value !== undefined)
    payload.leverage = Number(leverage.value);
  return payload;
}

async function runPreview() {
  if (!selectedProfile.value) return;
  loading.value = true;
  try {
    preview.value = await botStore.activeBot.previewStrategyProfile(buildPayload());
  } catch (error) {
    preview.value = null;
  } finally {
    loading.value = false;
  }
}

async function apply() {
  if (!canApply.value) return;
  if (!preview.value) {
    await runPreview();
    if (!preview.value) return;
  }
  if (
    !(await confirm({
      title: t('controls.runtimeApplyTitle'),
      message: t('controls.runtimeApplyMessage'),
    }))
  )
    return;
  applying.value = true;
  try {
    await botStore.activeBot.applyStrategyProfile(buildPayload());
    preview.value = null;
  } finally {
    applying.value = false;
  }
}
</script>

<template>
  <div
    v-if="botStore.activeBot.isTrading"
    class="mt-4 rounded border border-neutral-400 p-3 space-y-3"
  >
    <div class="font-semibold">{{ t('controls.runtimeSettings') }}</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
      <UFormField :label="t('controls.strategyLabel')">
        <USelectMenu
          v-model="profileId"
          value-key="value"
          :items="profileItems"
          :placeholder="t('controls.strategyPlaceholder')"
          class="w-full"
        />
      </UFormField>
      <UFormField :label="t('controls.timeframeLabel')">
        <USelect
          v-model="selectedTimeframe"
          :items="selectedProfile?.runtime_timeframes || []"
          class="w-full"
        />
      </UFormField>
      <UFormField v-if="canUseLeverage" :label="t('controls.leverageLabel')">
        <UInputNumber
          v-model="leverage"
          :min="1"
          :max="125"
          :step="0.5"
          :max-fraction-digits="1"
          class="w-full"
        />
      </UFormField>
    </div>
    <div v-if="canUseShort" class="flex items-center gap-2">
      <BaseCheckbox v-model="shortEnabled">{{ t('controls.shortEnabledLabel') }}</BaseCheckbox>
    </div>
    <p v-if="botStore.activeBot.runtimeSettings?.warning" class="text-sm text-amber-600">
      {{ botStore.activeBot.runtimeSettings.warning }}
    </p>
    <p v-if="preview" class="text-sm text-green-600">
      {{
        t('controls.runtimePreviewReady', {
          strategy: preview.strategy,
          timeframe: preview.timeframe,
        })
      }}
    </p>
    <div class="flex flex-wrap gap-2">
      <UButton
        :loading="loading"
        :disabled="!selectedProfile"
        color="neutral"
        variant="outline"
        @click="runPreview"
      >
        {{ t('controls.runtimePreview') }}
      </UButton>
      <UButton :loading="applying" :disabled="!canApply" @click="apply">
        {{ t('controls.runtimeApply') }}
      </UButton>
    </div>
    <p v-if="!canApply" class="text-sm text-amber-600">
      {{ t('controls.runtimeOpenTradesWarning') }}
    </p>
  </div>
</template>
