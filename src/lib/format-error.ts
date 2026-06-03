import { ZodError } from 'zod';

export function formatParseError(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues
      .map((i) => `• ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}
