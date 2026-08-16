<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    showDetails?: boolean;
    approvedOnly?: boolean;
    disabled?: boolean;
  }>(),
  {
    showDetails: false,
    approvedOnly: false,
    disabled: false,
  },
);

const strategy = defineModel<string>();

const botStore = useBotStore();

const strategyCode = computed((): string => botStore.activeBot.strategy?.code ?? '');
const strategyItems = computed(() => {
  if (props.approvedOnly) {
    return botStore.activeBot.strategyProfiles
      .filter((profile) => profile.compatible)
      .map((profile) => profile.strategy);
  }
  return botStore.activeBot.strategyList;
});

watch(strategy, (newStrategy, oldStrategy) => {
  if (!newStrategy || newStrategy === oldStrategy) return;
  botStore.activeBot.getStrategy(newStrategy);
});

onMounted(() => {
  if (props.approvedOnly) {
    if (botStore.activeBot.strategyProfiles.length === 0) {
      botStore.activeBot.getStrategyProfiles();
    }
  } else if (botStore.activeBot.strategyList.length === 0) {
    botStore.activeBot.getStrategyList();
  }
});
</script>

<template>
  <div>
    <div class="w-full flex">
      <USelectMenu
        id="strategy-select"
        v-model="strategy"
        filter
        class="w-full"
        :items="strategyItems"
        :disabled="props.disabled"
      >
      </USelectMenu>
      <div class="ms-1">
        <UButton
          color="neutral"
          variant="outline"
          icon="mdi:refresh"
          @click="
            props.approvedOnly
              ? botStore.activeBot.getStrategyProfiles()
              : botStore.activeBot.getStrategyList()
          "
        />
      </div>
    </div>

    <textarea
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-full h-full"
    ></textarea>
  </div>
</template>
