import { apiRequest } from '@/shared/api/client';

import type {
  AnalysisRequest,
  AnalysisResponse,
  SaveAnalysisRequest,
  SaveAnalysisResponse,
  SharedAnalysisResponse,
} from '../types';

export function performAnalysis(request: AnalysisRequest) {
  return apiRequest<AnalysisResponse>('/api/analysis/perform', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function saveAnalysis(request: SaveAnalysisRequest) {
  return apiRequest<SaveAnalysisResponse>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getSharedAnalysis(id: string, signal?: AbortSignal) {
  return apiRequest<SharedAnalysisResponse>(`/api/analysis/${id}`, { signal });
}
