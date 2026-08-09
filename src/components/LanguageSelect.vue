<script setup lang="ts">
import { computed } from 'vue';

import { i18n, setLocale, type SupportedLocale } from '@/locales';

withDefaults(defineProps<{ showText?: boolean }>(), { showText: false });

const selectedLocale = computed<SupportedLocale>({
  get: () => i18n.global.locale.value as SupportedLocale,
  set: (value) => setLocale(value),
});

const localeOptions = [
  { label: '简体中文', value: 'zh-CN' as SupportedLocale },
  { label: 'English', value: 'en' as SupportedLocale },
];
</script>

<template>
  <div class="flex items-center gap-2">
    <span v-if="showText" class="text-sm text-neutral-500 dark:text-neutral-400">
      {{ $t('language.label') }}
    </span>
    <USelect
      v-model="selectedLocale"
      :items="localeOptions"
      value-key="value"
      label-key="label"
      size="sm"
      class="min-w-28"
      :aria-label="$t('language.label')"
    />
  </div>
</template>
