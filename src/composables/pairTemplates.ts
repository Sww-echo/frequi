import { useI18n } from 'vue-i18n';
export function usePairTemplates() {
  const { t } = useI18n();
  return {
    pairTemplates: computed(() => [
      { description: t('download.allUsdtPairs'), pairs: ['.*/USDT'], idx: 0 },
      { description: t('download.allUsdtFuturesPairs'), pairs: ['.*/USDT:USDT'], idx: 1 },
    ]),
  };
}
