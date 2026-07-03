import { defineConfig } from 'tsup';

// Bundle the client into a self-contained package: a single ESM + CJS file plus
// a bundled .d.ts. `@adnet/shared` is a type-only workspace dependency, so it's
// inlined into the declarations here — the published @adviverse/sdk has zero
// runtime or workspace dependencies.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  bundle: true,
  platform: 'neutral',
  target: 'es2021',
  clean: true,
  sourcemap: false,
});
