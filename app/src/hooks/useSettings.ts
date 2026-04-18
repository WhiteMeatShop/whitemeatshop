import { useLiveQuery } from 'dexie-react-hooks';
import { db, defaultSettings } from '@/db/database';
import type { AppSettings } from '@/types';

export function useSettings() {
  const settings = useLiveQuery(
    () => db.settings.get('app'),
    []
  );

  const updateSettings = async (updates: Partial<AppSettings>) => {
    await db.settings.update('app', updates);
  };

  const resetSettings = async () => {
    await db.settings.put({ ...defaultSettings, id: 'app' });
  };

  return { 
    settings: settings ?? defaultSettings, 
    updateSettings, 
    resetSettings 
  };
}
