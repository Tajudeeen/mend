# Connect MEND's live services

The primary application is https://usemend.vercel.app, deployed on Vercel with Next.js. It uses Supabase Auth and PostgreSQL for saved organizer events. Authentication and the limited PostgreSQL connection are configured; the deployed Prisma table-read readiness probe passed. The owner reported a passing Groq tool-call check. Full authenticated writes and live Qloo repair still need verification. The retired ChatGPT Site link is no longer the review or submission destination. Compatibility code retains its separate identity and storage boundaries.

## 1. Request Qloo access

1. Join the current event at https://qloo.devpost.com/.
2. Open https://qloo.devpost.com/resources and follow the first API-key link. The developer guide linked from the overview is: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide#getting-your-api-key. The current rules explicitly direct entrants to that form: https://qloo.devpost.com/rules.
3. Use the key and API origin supplied with that access. Set `QLOO_API_KEY` and `QLOO_API_BASE` on the server. MEND allows `https://api.qloo.com`, `https://hackathon.api.qloo.com` and `https://staging.api.qloo.com`. These hosts are not interchangeable accounts. Do not guess an API host or send a key to several hosts to find a match.

The developer-guide page was unavailable to the research tool during this handoff. Follow the current organizer link rather than an old contest's direct form URL.

## 2. Create a model API key

MEND supports an HTTPS OpenAI-compatible Chat Completions endpoint with tool calling. Create a project key with your chosen provider. For OpenAI, use https://platform.openai.com/api-keys and the official quickstart at https://developers.openai.com/api/docs/quickstart.

Set all three server variables:

| Variable       | Value                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| `LLM_API_KEY`  | Your provider's project API key                                                        |
| `LLM_BASE_URL` | Provider API base, including its version path. For OpenAI: `https://api.openai.com/v1` |
| `LLM_MODEL`    | An exact model ID your project can access that supports Chat Completions tool calls    |

The endpoint must have no embedded credentials, query string or fragment. MEND refuses redirects for keyed Qloo and model calls. A short connection probe uses API quota; a passing probe does not prove full recovery quality.

### Selected provider: Groq

The selected configuration, verified for a bounded missing-input investigation, is Groq's OpenAI-compatible Chat Completions API:

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=qwen/qwen3.8-27b
LLM_API_KEY=YOUR_GROQ_KEY
```

Create the key at https://console.groq.com/keys and enter it only in Vercel's Production `LLM_API_KEY` secret. Replace the OpenAI key; keys are not interchangeable between providers. Redeploy after changing environment variables, then run Account & connections → Test Qloo and model. A passing probe does not establish full repair quality.

The adapter blocks recognizable OpenAI keys on Groq and Groq keys on OpenAI before sending a request. Groq GPT-OSS requests use low reasoning effort and sequential tool calls. The isolated connection probe allows 1,024 output tokens to include reasoning; other model probes remain at 128. The agent's 8-step/16-tool budget and human-approval requirement remain unchanged.

Groq's free plan currently lists this model with per-minute and daily limits. Multi-step agent runs can hit those limits; availability through judging still needs verification. The host requires meaningful Qloo-integrated agentic behavior, not a particular LLM vendor. Sources checked October 28, 2026: https://console.groq.com/docs/rate-limits, https://console.groq.com/docs/openai, https://console.groq.com/docs/reasoning and https://qloo.devpost.com/rules. The deployed Qwen probe and a three-tool missing-input investigation passed during the October 28–29 session. GPT-OSS trials and an unavailable Llama ID remain recorded as failed; Qwen was selected from the authenticated catalogue. A complete approved event recovery remains unverified.

## 3. Finish Supabase and Vercel configuration

The Supabase project already exists: `mend`, project reference `qentnogldttrhmobgpzk`. Do not create another one.

Get its URL and publishable key through the project Connect dialog. Configure:

| Variable                               | Purpose                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://qentnogldttrhmobgpzk.supabase.co`                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project publishable key used for Auth                                      |
| `DATABASE_URL`                         | Reachable TLS database URL for the limited `mend_runtime` application role |
| `DATABASE_CA_CERT`                     | Provider root CA PEM from Supabase Database Settings when required |
| `DIRECT_URL`                           | Privileged migration URL, only in the migration environment                |

Get database endpoint/connection details from Supabase Connect. Use the limited runtime login, not an admin or RLS-bypass role. The previous direct connection failed DNS resolution; verify the chosen endpoint from the application host. Migration baselining remains pending. Follow `docs/DEPLOYMENT.md` before any Prisma migration deployment against this existing database.

In Vercel, select the team containing the existing `mend` project, then open Settings → Environment Variables. The connected Vercel integration can now inspect the project and its successful production deployment; the earlier team-scope HTTP 403 is historical. Configure the production environment for this project. References: https://vercel.com/docs/project-configuration/project-settings and https://vercel.com/docs/rbac/access-roles.

Add the applicable variables above and the Qloo/model variables, choose Node 24 and build command `pnpm build:node`, then create a new deployment. Environment changes apply to new deployments. Keep all secrets out of chat, Git and browser-exposed variables. Only the two Supabase public values use `NEXT_PUBLIC_`.

In Supabase Auth → URL Configuration, set the production Site URL to `https://usemend.vercel.app` and allow `https://usemend.vercel.app/auth/callback`. The signup flow sets this callback explicitly. Both PKCE code callbacks and email token-hash callbacks are supported. For the token-hash email flow, the confirmation template link is:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email"
  >Confirm your email</a
>
```

See https://supabase.com/docs/guides/auth/server-side/creating-a-client and https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs. Configure templates and redirect allowlists in the same Supabase project used by the Node deployment. MEND shows confirmation-required state, sign-in, current-session sign-out and automatic cookie renewal. Supabase remains responsible for rate limiting signup/sign-in requests.

Vercel is the deployment to configure and share. The retained compatibility runtime has separate server configuration and does not receive Vercel environment changes.

## 4. Verify live behavior

1. Open Account & connections, sign in and select **Test Qloo and model**. Results distinguish missing, passed and failed connections. Checks run one Qloo search and one short model tool-call request. They save no evidence or event changes. Three checks per minute per organizer are allowed per process; global throttling belongs at the hosting edge.
2. On the Node deployment, verify signup → email confirmation → sign-in → event creation → page reload → session renewal → sign-out. Verify a second organizer cannot read or change the first organizer's event. Mocked auth/proxy tests do not replace this deployment test.
3. Create a real live event. Resolve audience/participant references, collect complete Qloo cohort evidence, run a recovery and review the tool trace. Approve explicitly, reload and export the report. The diagnostic search is not scored event evidence.
4. Verify PostgreSQL normalized writes, immutable snapshots, stale-write protection and request replay through the actual application with the limited runtime role.
5. Complete the paired organizer trial at `/study`, review raw timings and document limitations. No benefit percentage is claimed before that study.

Real credentials, Node deployment authorization/connectivity, full browser/device checks and an actual organizer trial remain external release gates. Automated local tests cannot supply them.


## Preparation while access is pending

The owner received the Qloo key on October 28, 2026. It is configured server-side with the assigned `https://hackathon.api.qloo.com` origin. The origin correction reached a ready production deployment. A successful search/insights response and complete live repair still need their own observed evidence. No key is recorded in source.

The live event overview now lists six preparation checks with destinations for missing inputs: roster/slots/zones, audience seeds, participant references, comparable evidence, a valid plan and confirmed terms. It evaluates event contents only. Completing this checklist does not establish a working provider connection or a successful live repair.

A report can be checked locally in the browser at `/verify`. The file is not uploaded. Its checker is shared with the CLI, rejects missing/duplicate/unreferenced receipts and modified raw responses, and treats an empty receipt list as no evidence. Passing hashes do not authenticate Qloo or verify derived ranks.

Database connections always verify TLS certificates and hostnames. When the host does not trust the Supabase certificate chain, set `DATABASE_CA_CERT` to the certificate offered in Supabase Database Settings. Do not disable certificate verification. The deployed database probe is `/api/health?probe=database`; event writes and ownership isolation still require separate verification.
