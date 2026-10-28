# Connect MEND's live services

The existing preview is https://mend-events.deeen-code.chatgpt.site. It uses ChatGPT identity and D1. The primary Next.js/Supabase deployment is separate and has not yet been verified live.

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

## 3. Finish Supabase and Vercel configuration

The Supabase project already exists: `mend`, project reference `qentnogldttrhmobgpzk`. Do not create another one.

Get its URL and publishable key through the project Connect dialog. Configure:

| Variable                               | Purpose                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://qentnogldttrhmobgpzk.supabase.co`                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project publishable key used for Auth                                      |
| `DATABASE_URL`                         | Reachable TLS database URL for the limited `mend_runtime` application role |
| `DIRECT_URL`                           | Privileged migration URL, only in the migration environment                |

Get database endpoint/connection details from Supabase Connect. Use the limited runtime login, not an admin or RLS-bypass role. The previous direct connection failed DNS resolution; verify the chosen endpoint from the application host. Migration baselining remains pending. Follow `docs/DEPLOYMENT.md` before any Prisma migration deployment against this existing database.

In Vercel, select the team containing the existing `mend` project, then open Settings → Environment Variables. The connected integration previously received HTTP 403 for the `deeencodes` team scope. Check that the connected account/integration can access this project and manage production environment variables. Reconnect the Vercel integration to that authorized team if necessary. If you cannot change production variables yourself, a team owner/project administrator can configure them. References: https://vercel.com/docs/project-configuration/project-settings and https://vercel.com/docs/rbac/access-roles.

Add the applicable variables above and the Qloo/model variables, choose Node 24 and build command `pnpm build:node`, then create a new deployment. Environment changes apply to new deployments. Keep all secrets out of chat, Git and browser-exposed variables. Only the two Supabase public values use `NEXT_PUBLIC_`.

In Supabase Auth → URL Configuration, set the production Site URL and allow `https://YOUR-NODE-ORIGIN/auth/callback`. Use your actual deployed origin. The signup flow sets this callback explicitly. Both PKCE code callbacks and email token-hash callbacks are supported. For the token-hash email flow, the confirmation template link is:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email"
  >Confirm your email</a
>
```

See https://supabase.com/docs/guides/auth/server-side/creating-a-client and https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs. Configure templates and redirect allowlists in the same Supabase project used by the Node deployment. MEND shows confirmation-required state, sign-in, current-session sign-out and automatic cookie renewal. Supabase remains responsible for rate limiting signup/sign-in requests.

For the existing Sites deployment, set only `QLOO_API_KEY`, `QLOO_API_BASE`, `LLM_API_KEY`, `LLM_BASE_URL` and `LLM_MODEL` in that deployment's server environment. Supabase configuration on Vercel does not configure the separate Sites Worker.

## 4. Verify live behavior

1. Open Account & connections, sign in and select **Test Qloo and model**. Results distinguish missing, passed and failed connections. Checks run one Qloo search and one short model tool-call request. They save no evidence or event changes. Three checks per minute per organizer are allowed per process; global throttling belongs at the hosting edge.
2. On the Node deployment, verify signup → email confirmation → sign-in → event creation → page reload → session renewal → sign-out. Verify a second organizer cannot read or change the first organizer's event. Mocked auth/proxy tests do not replace this deployment test.
3. Create a real live event. Resolve audience/participant references, collect complete Qloo cohort evidence, run a recovery and review the tool trace. Approve explicitly, reload and export the report. The diagnostic search is not scored event evidence.
4. Verify PostgreSQL normalized writes, immutable snapshots, stale-write protection and request replay through the actual application with the limited runtime role.
5. Complete the paired organizer trial at `/study`, review raw timings and document limitations. No benefit percentage is claimed before that study.

Real credentials, Node deployment authorization/connectivity, full browser/device checks and an actual organizer trial remain external release gates. Automated local tests cannot supply them.


## Preparation while access is pending

The owner requested Qloo access on October 28, 2026 and expects a response in about 24 hours. That expectation is not a confirmed provider service-level guarantee. No key or live response is recorded in source.

The live event overview now lists six preparation checks with destinations for missing inputs: roster/slots/zones, audience seeds, participant references, comparable evidence, a valid plan and confirmed terms. It evaluates event contents only. Completing this checklist does not establish a working provider connection or a successful live repair.

A report can be checked locally in the browser at `/verify`. The file is not uploaded. Its checker is shared with the CLI, rejects missing/duplicate/unreferenced receipts and modified raw responses, and treats an empty receipt list as no evidence. Passing hashes do not authenticate Qloo or verify derived ranks.
