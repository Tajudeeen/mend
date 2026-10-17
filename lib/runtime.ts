import { AsyncLocalStorage } from "node:async_hooks";
export type RuntimeEnv = {
  DB?: D1Database;
  QLOO_API_KEY?: string;
  QLOO_API_BASE?: string;
  LLM_API_KEY?: string;
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  MEND_SITE_COMPAT?: boolean;
};
const storage = new AsyncLocalStorage<RuntimeEnv>();
export function withRuntime<T>(env: RuntimeEnv, fn: () => T): T {
  return storage.run({ ...env, MEND_SITE_COMPAT: true }, fn);
}
export function runtimeEnv(): RuntimeEnv {
  return (
    storage.getStore() ?? {
      QLOO_API_KEY: process.env.QLOO_API_KEY,
      QLOO_API_BASE: process.env.QLOO_API_BASE,
      LLM_API_KEY: process.env.LLM_API_KEY,
      LLM_BASE_URL: process.env.LLM_BASE_URL,
      LLM_MODEL: process.env.LLM_MODEL,
    }
  );
}
