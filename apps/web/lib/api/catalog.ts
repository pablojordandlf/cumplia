import { api } from './client';

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  sector: string;
  typical_ai_act_level: string;
  template_data: Record<string, unknown>;
}

export const catalogApi = {
  list: (sector?: string) => {
    const params = sector ? `?sector=${encodeURIComponent(sector)}` : '';
    return api.get<CatalogItem[]>(`/catalog${params}`);
  },
  
  get: (id: string) => api.get<CatalogItem>(`/catalog/${id}`),
  
  bySector: (sector: string) => api.get<CatalogItem[]>(`/catalog/by-sector/${encodeURIComponent(sector)}`),
};
