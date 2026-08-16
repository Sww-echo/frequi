<script setup lang="ts">
definePage({
  meta: {
    allowAnonymous: true,
  },
});
</script>

<template>
  <div class="max-w-xl mx-auto p-4 my-5">
    <DraggableContainer :header="$t('login.title')" class="px-4 py-2">
      <BotLogin />
    </DraggableContainer>
  </div>
</template>
