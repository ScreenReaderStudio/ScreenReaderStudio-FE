import { apiRequest } from '@/shared/api/client';

import type {
  AnalysisJobResponse,
  AnalysisRequest,
  AnalysisResponse,
  CreateAnalysisJobResponse,
  SaveAnalysisRequest,
  SaveAnalysisResponse,
  SharedAnalysisResponse,
} from '../types';

function jobHeaders(accessToken: string) {
  return { 'X-Analysis-Job-Token': accessToken };
}

export function createAnalysisJob(
  request: AnalysisRequest,
  credentials: { accessToken: string; idempotencyKey: string },
  signal?: AbortSignal
) {
  return apiRequest<CreateAnalysisJobResponse>('/api/analysis/jobs', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      ...jobHeaders(credentials.accessToken),
      'Idempotency-Key': credentials.idempotencyKey,
    },
    signal,
  });
}

export function getAnalysisJob(jobId: string, accessToken: string, signal?: AbortSignal) {
  return apiRequest<AnalysisJobResponse>(`/api/analysis/jobs/${jobId}`, {
    headers: jobHeaders(accessToken),
    signal,
  });
}

export function getAnalysisJobResult(jobId: string, accessToken: string, signal?: AbortSignal) {
  return apiRequest<AnalysisResponse>(`/api/analysis/jobs/${jobId}/result`, {
    headers: jobHeaders(accessToken),
    signal,
  });
}

export function cancelAnalysisJob(jobId: string, accessToken: string, signal?: AbortSignal) {
  return apiRequest<AnalysisJobResponse>(`/api/analysis/jobs/${jobId}`, {
    method: 'DELETE',
    headers: jobHeaders(accessToken),
    signal,
  });
}

export function saveAnalysis(request: SaveAnalysisRequest, accessToken: string) {
  return apiRequest<SaveAnalysisResponse>('/api/analysis', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: jobHeaders(accessToken),
  });
}

export function getSharedAnalysis(id: string, signal?: AbortSignal) {
  return apiRequest<SharedAnalysisResponse>(`/api/analysis/${id}`, { signal });
}
