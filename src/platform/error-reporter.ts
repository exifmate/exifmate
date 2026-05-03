import { emit } from '@tauri-apps/api/event';

export const ERROR_REPORTED_EVENT = 'error:reported';

export interface ErrorReport {
  message: string;
  detail: string;
}

function normalizeDetail(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error == null) return '';
  return String(error);
}

export function reportError(message: string, error: unknown): void {
  console.error(`${message}:`, error);
  emit(ERROR_REPORTED_EVENT, {
    message,
    detail: normalizeDetail(error),
  } satisfies ErrorReport).catch((err) => {
    console.error('Failed to emit error report:', err);
  });
}
