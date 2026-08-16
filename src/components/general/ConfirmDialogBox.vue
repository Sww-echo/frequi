<script setup lang="ts">
export interface ConfirmDialogBoxProps {
  title: string;
  description?: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
}
withDefaults(defineProps<ConfirmDialogBoxProps>(), {
  description: '',
  cancelText: '',
  confirmText: '',
});
defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal :title="title" :ui="{ footer: 'justify-end' }" :description="description || $t('general.confirmation')">
    <template #body>
      <div class="whitespace-pre-wrap">
        {{ message }}
      </div>
    </template>
    <template #footer>
      <UButton
        class="min-w-30"
        :label="cancelText || $t('common.cancel')"
        variant="outline"
        color="neutral"
        icon="mdi:close"
        @click="$emit('close', false)"
      />
      <UButton
        class="min-w-30"
        :label="confirmText || $t('common.confirm')"
        icon="mdi:check"
        autofocus
        @click="$emit('close', true)"
      />
    </template>
  </UModal>
</template>
