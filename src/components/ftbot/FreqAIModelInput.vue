<script setup lang="ts">
import type { BacktestFreqAIInput } from '@/types';

const freqAI = defineModel<BacktestFreqAIInput>({ required: true });
</script>

<template>
  <div class="flex justify-end items-center">
    <span class="me-2">{{ $t('freqai.enable') }}</span>
    <InfoBox
      :hint="$t('freqai.hint')"
    />
  </div>
  <BaseCheckbox id="enable-freqai" v-model="freqAI.enabled"></BaseCheckbox>

  <template v-if="freqAI.enabled">
    <label for="freqai-identifier">{{ $t('freqai.identifier') }}</label>
    <UInput
      id="freqai-identifier"
      v-model="freqAI.identifier"
      :placeholder="$t('backtest.useConfigDefault')"
    ></UInput>
  </template>
  <template v-if="freqAI.enabled">
    <label for="freqai-model">{{ $t('freqai.model') }}</label>
    <FreqaiModelSelect id="freqai-model" v-model="freqAI.model"></FreqaiModelSelect>
  </template>
</template>
