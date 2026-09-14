import { api } from './client';

export interface IntegrationCapabilities { ocr: boolean; payment: boolean; socialLogin: boolean; paySync: boolean; push: boolean }
export async function fetchIntegrationCapabilities(): Promise<IntegrationCapabilities> {
  return (await api.get<IntegrationCapabilities>('/api/integrations')).data;
}