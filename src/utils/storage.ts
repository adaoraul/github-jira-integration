import { api } from './browser-api';
import { DEFAULT_PR_TEMPLATE } from '../templates/pr-template';

export interface StorageData {
  jiraUrl: string;
  jiraEmail: string;
  jiraApiToken: string;
  acceptanceStartString: string;
  acceptanceEndString: string;
  prTemplateEnabled: boolean;
  prTitleEnabled: boolean;
  prTemplate: string;
}

const DEFAULT_STORAGE_DATA: StorageData = {
  jiraUrl: '',
  jiraEmail: '',
  jiraApiToken: '',
  acceptanceStartString: 'h3. Acceptance Criteria',
  acceptanceEndString: 'h3. Notes',
  prTemplateEnabled: true,
  prTitleEnabled: true,
  prTemplate: DEFAULT_PR_TEMPLATE,
};

/**
 * Storage wrapper with type safety and default values
 */
export class Storage {
  static async get<K extends keyof StorageData>(keys?: K | K[]): Promise<Partial<StorageData>> {
    try {
      const keysArray = keys
        ? Array.isArray(keys)
          ? keys
          : [keys]
        : Object.keys(DEFAULT_STORAGE_DATA);
      const result = await api.storage.sync.get(keysArray);

      // Apply defaults for missing values
      const data: Partial<StorageData> = {};
      for (const key of keysArray) {
        const typedKey = key as keyof StorageData;
        (data as any)[typedKey] = result[typedKey] ?? DEFAULT_STORAGE_DATA[typedKey];
      }

      return data;
    } catch (error) {
      console.error('Error getting storage data:', error);
      // Return appropriate default based on what was requested
      if (!keys) {
        return DEFAULT_STORAGE_DATA;
      }
      const partial: Partial<StorageData> = {};
      const requestedKeys = Array.isArray(keys) ? keys : [keys];
      for (const key of requestedKeys) {
        partial[key] = DEFAULT_STORAGE_DATA[key];
      }
      return partial;
    }
  }

  static async getAll(): Promise<StorageData> {
    try {
      const result = await api.storage.sync.get(null);
      return { ...DEFAULT_STORAGE_DATA, ...result };
    } catch (error) {
      console.error('Error getting all storage data:', error);
      return DEFAULT_STORAGE_DATA;
    }
  }

  static async set(data: Partial<StorageData>): Promise<void> {
    try {
      await api.storage.sync.set(data);
    } catch (error) {
      console.error('Error setting storage data:', error);
      throw error;
    }
  }

  static async remove(keys: keyof StorageData | (keyof StorageData)[]): Promise<void> {
    try {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      await api.storage.sync.remove(keysArray);
    } catch (error) {
      console.error('Error removing storage data:', error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await api.storage.sync.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export { DEFAULT_STORAGE_DATA };
