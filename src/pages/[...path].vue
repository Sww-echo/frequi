<template>
  <div>
    <h1 class="mb-5">{{ $t('errors.notFoundTitle') }}</h1>
    <p class="h4">{{ $t('errors.pageNotFound') }}</p>
    <p>
      {{ $t('errors.pageNotFoundHint') }}
      <RouterLink to="/"> <span>{{ $t('errors.mainPage') }}</span> </RouterLink>.
    </p>
  </div>
</template>
