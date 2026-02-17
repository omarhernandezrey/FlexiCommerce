import { usePreferencesStore } from '@/store/preferences';

export const usePreferences = () => {
  return usePreferencesStore();
};
