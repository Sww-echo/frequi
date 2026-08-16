<script setup lang="ts">
const values = defineModel<string[]>({ required: true });
withDefaults(
  defineProps<{
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    placeholder: '',
    size: 'md',
  },
);
</script>

<template>
  <div class="flex flex-row gap-2">
    <div class="flex gap-1 flex-col w-full">
      <div v-for="(val, idx) in values" :key="idx" class="flex flex-row gap-1">
        <UInput
          v-model="values[idx]"
          :size="size"
          class="w-full"
          :placeholder="placeholder"
        ></UInput>
        <UButton
          color="neutral"
          variant="outline"
          :title="$t('general.deleteThis', { name: $t('common.value') })"
          class="flex align-items-center justify-content-center"
          icon="mdi:delete"
          @click="values.splice(idx, 1)"
        />
      </div>
    </div>
    <UButton
      :title="$t('general.addNew', { name: $t('common.value') })"
      color="neutral"
      class="mt-auto flex align-items-center justify-content-center"
      icon="mdi:plus-box-outline"
      @click="values.push('')"
    />
  </div>
</template>
