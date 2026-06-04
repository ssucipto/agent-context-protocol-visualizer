export interface CommandMeta {
  name: string;
  namespace: string;
  version: string;
  status: string;
  purpose: string;
  category: string;
  frequency: string;
  scripts: string | null;
  flags: string[];
}
