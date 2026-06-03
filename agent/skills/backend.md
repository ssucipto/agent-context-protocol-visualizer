<skill name="backend">
<rules>
- Use TanStack Start server functions (createServerFn) for all filesystem reads — never read YAML client-side
- All YAML parsing must go through src/lib/yaml-loader.ts (parseProgressYaml) for type safety
- React components receive data via useProgressData() hook — never call server functions directly from components
- Server functions use .inputValidator() for input validation, return { data, error } shape
- Polling: use fetchWatchToken (mtime) not fetchProgress for the 2s check loop
- Component files: one component per file, named export, in src/components/
- Use Tailwind CSS utility classes only — no custom CSS files except styles.css for @import
</rules>
<patterns>
```ts
// Server function pattern
export const fetchProgress = createServerFn({ method: 'GET' })
  .inputValidator((input: { path?: string }) => input)
  .handler(async ({ data }) => {
    // read file, parse, return { data, error }
  });

// Hook pattern
export function useProgressData(path?: string) {
  const [data, setData] = useState<ProgressData | null>(null);
  const load = async () => { /* call server fn, set state */ };
  useEffect(() => { void load(); /* poll loop */ }, []);
  return { data, error, loading };
}

// Component pattern
export function MyComponent({ ... }: Props) { /* pure presentational */ }
```
</patterns>
<anti_patterns>
- NEVER import 'fs' or 'js-yaml' directly in client components — use server functions
- NEVER call fetchProgress in the polling loop — use fetchWatchToken to check mtime first
- NEVER mutate ProgressData directly — treat all data as read-only from the YAML source
- NEVER hardcode the progress.yaml path in components — use the PROGRESS_YAML_PATH env var or hook parameter
- NEVER use inline styles — use Tailwind utility classes
</anti_patterns>
</skill>
