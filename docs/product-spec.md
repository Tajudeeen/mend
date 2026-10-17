# MASTER ENGINEERING PROMPT: MEND
## AI-Powered Cultural Event Intelligence, Planning and Recovery Platform

### 0. Your role and working principles

Act as a senior software engineer, systems architect, AI/agent engineer, product manager, UI/UX designer, database architect, security engineer, QA engineer, DevOps engineer, and independent product evaluator.

You are responsible for designing, implementing, testing, deploying, documenting, and auditing **MEND**, a complete AI-powered cultural event intelligence and recovery platform.

Approach this as a serious product engineering engagement and a competitive submission to the **Qloo Agentic Hackathon 2026**.

Do not build a superficial prototype, chatbot wrapper, collection of static dashboards, or UI with nonfunctional buttons.

Be skeptical of features and technical assumptions. Challenge anything that cannot be supported by actual APIs, meaningful logic, verifiable evidence, or the intended user's needs.

Make architectural decisions deliberately. Optimize for correctness, usability, reliability, maintainability, elegance, and completion.

Do not invent test results, cultural affinities, API responses, booking availability, event economics, or operational feasibility.

You have authorization to plan and implement the product in an appropriate development environment. External account connections, credentials, production releases, and irreversible actions must follow available permissions.

**Project name:** MEND

**Working positioning:** Cultural intelligence for events that need to work, even when plans change.

**Core promise:** Help event organizers design culturally coherent experiences, handle unexpected disruptions, and produce transparent, workable recovery plans.

---

# PHASE 1: UNDERSTAND THE PRODUCT AND ITS PURPOSE

## 1.1 Problem statement

Temporary events are difficult to plan and even harder to repair.

Music-led festivals, cultural markets, creative pop-ups, and community experiences combine many interconnected elements:

- Performing artists and entertainment.
- Food vendors and available offerings.
- Retail brands, stalls, and experiences.
- Intended audience interests.
- Venues, spaces, and physical restrictions.
- Budgets, scheduling, and operational requirements.
- Cultural identity and programme coherence.

Organizers must make decisions without always understanding how these elements culturally relate to one another.

When a performer cancels, a food vendor withdraws, or physical event space becomes unavailable, changing one component can affect several others.

Existing event-management software often focuses on ticketing, scheduling, logistics, and registration.

MEND will focus on culturally grounded planning and controlled recovery, combining Qloo cultural intelligence with deterministic operational planning.

## 1.2 Product definition

MEND is an AI-assisted platform that can:

1. Create and manage an event programme.
2. Build a cultural profile from known artists, brands, places, and organizer-provided audience interests.
3. Discover culturally relevant performers and experiences through Qloo.
4. Evaluate combinations of performers, vendors, and activities.
5. Propose operationally feasible allocations for the available space.
6. Compare cultural compatibility across different programme choices.
7. Simulate disruptions and construct alternative plans.
8. Preserve locked commitments during recovery.
9. Validate proposed changes against hard operational rules.
10. Explain recommendations using actual Qloo evidence.
11. Allow organizers to approve, reject, or modify proposals.
12. Produce persistent, auditable recovery reports.

The product must be capable of detecting and reporting that no feasible solution exists.

## 1.3 Initial target customers

Focus on:

- Independent festival organizers.
- Music-led night-market operators.
- Cultural pop-up organizers.
- Small and medium-sized event promoters.
- Creative event programmers.

Avoid supporting every possible event industry in the first release.

The main hackathon scenario is a culturally curated night market combining music, food, independent retail, and shared audience interests.

## 1.4 Product differentiation

MEND must offer more than cultural recommendations.

Its distinctive capability is **Cultural Continuity Recovery**.

It investigates how disruptions change a planned event's cultural composition, then uses Qloo-backed candidate discovery and operational constraints to construct an explainable alternative.

The organizer can see:

- What changed.
- Which cultural relationships may be affected.
- Which replacements were considered.
- Which hard constraints were checked.
- What information remains unknown.
- Why one alternative was preferred.
- Which existing commitments were preserved.

Do not claim to predict audience satisfaction, attendance retention, or revenue without separately validated outcome models.

---

# PHASE 2: HACKATHON REQUIREMENTS

Use the official Qloo Agentic Hackathon requirements.

Competition: https://qloo.devpost.com/

Official rules: https://qloo.devpost.com/rules

Submission deadline: October 30, 2026, 11:45 PM EDT.

The hackathon has four equally weighted judging categories.

| Criterion | Weight |
|---|---|
| Technological implementation and depth of Qloo integration | 25% |
| Product design and completeness | 25% |
| Credible real-world impact | 25% |
| Quality and originality of the idea | 25% |

Every significant architectural decision should contribute to one or more of these criteria.

Do not optimize the entire product for only its technical score.

### Required deliverables

- A publicly accessible and functional deployed application.
- A public source repository.
- A recognized open-source license.
- Complete installation and testing instructions.
- An accurate project description.
- Real Qloo API integration.
- A working agentic workflow.
- An accessible end-to-end evaluation experience.
- Documentation describing how Qloo materially improves the decision.

A demo video is optional under the official rules, but prepare the application for a compelling recorded demonstration.

Keep the application accessible for judging without requiring a paid subscription, private invitation, or an unavailable external service.

---

# PHASE 3: TECHNICAL STACK

Use a TypeScript-first modular architecture.

Choose the latest mutually compatible stable versions available in the development environment. Verify versions before installing packages and commit a reproducible lockfile.

## Frontend

- Next.js with App Router.
- React.
- TypeScript with strict mode.
- Tailwind CSS.
- shadcn/ui.
- Radix UI primitives through shadcn where useful.
- Lucide React icons.
- Motion for React for animations.
- React Hook Form.
- Zod.
- TanStack Query.
- Zustand for lightweight client-only workspace state.
- SVG-based spatial editor with dnd-kit or an appropriately tested accessible drag-and-drop library.
- Recharts for concise, meaningful analytics.

Do not add multiple UI libraries that solve the same problem.

## Backend

- Next.js Route Handlers using the Node.js runtime.
- TypeScript services and domain modules.
- Server-only Qloo integration.
- Bounded agent orchestration.
- Structured tool-calling interface for the chosen LLM.
- Deterministic constraint validation and allocation.
- Zod request, response, and tool-schema validation.
- Server-side authorization and rate limiting.

Start as one modular application. Introduce a separate worker and durable queue only if actual execution times, retries, or deployment restrictions justify them.

Never rely on an unawaited background promise inside a short-lived serverless request for persistent work.

## Database

- Supabase PostgreSQL.
- Prisma ORM and migrations.
- Supabase Auth for authenticated organizer accounts.
- Transactional writes for approved plan revisions.
- PostgreSQL constraints and indexes for data integrity.
- Row-level security or equivalent verified server authorization boundaries.
- Supabase Storage only for user-authorized uploads or generated assets when needed.

A public sample workflow must remain usable without registration.

## AI and agent layer

- Qloo Taste AI API as the cultural intelligence provider.
- One primary agent orchestrator.
- An LLM provider adapter using a supported SDK or OpenAI-compatible interface.
- A configured, accessible model capable of structured tool use.
- Deterministic ranking, constraint checks, and approval policies.
- Versioned agent tool schemas.
- Evidence-based explanation generation.

Do not hardcode the application to a particular paid model.

Prefer using an already available model provider through an environment variable.

Do not add LangChain, LangGraph, or another agent framework unless its benefits clearly justify the complexity. A tested bounded orchestrator is preferable for the initial scope.

## Testing

- Vitest.
- React Testing Library.
- Playwright.
- Mock Service Worker where useful.
- Static TypeScript checks.
- ESLint.
- Prettier.
- GitHub Actions CI.
- Dependency and secret scanning.

## Deployment

Primary options:

- Vercel for the Next.js application.
- Supabase for data and authentication.

Alternative:

- Railway for a Node-compatible deployment if execution requirements are unsuitable for the selected Vercel configuration.

Do not deploy to multiple providers solely for appearance.

Select one production environment after validating its execution limits, environment-variable management, reliability, and available resources.

## Observability

- Structured application logs.
- Correlation and run IDs.
- Qloo request metadata without secrets.
- Agent tool-execution traces.
- Sanitized error reports.
- Optional Sentry integration if credentials and configuration are available.

---

# PHASE 4: REQUIRED APIS, SERVICES, TOOLS AND PLUGINS

## 4.1 Qloo Taste AI API

Official documentation:

https://docs.qloo.com/

Official public API specification:

https://github.com/qloo/docs-public

Use the official OpenAPI specification to establish the exact available endpoints, request schemas, valid enum values, and response structures.

Obtain the Qloo hackathon API key through the official developer access process.

Use environment variables for the authorized Qloo API host and key.

Potential hackathon host:

`https://hackathon.api.qloo.com`

Do not assume this host or every endpoint is accessible under the actual key. Validate both before implementation.

Authentication uses the documented `X-Api-Key` header.

### Required Qloo operations

**Entity Search**

`GET /search`

Use for matching organizer-entered artists, brands, and supported places to canonical Qloo entities.

Never invent entity IDs.

Support ambiguous matches, unresolved entities, and manual confirmation.

**Tag Discovery**

`GET /v2/tags`

Use for discovering supported cultural tags, categories, genres, and other documented labels.

Validate all tag identifiers before passing them to subsequent queries.

**Insights**

`GET /v2/insights`

Use for culturally grounded candidate discovery and affinity analysis.

Investigate documented parameters including:

- `filter.type`
- `signal.interests.entities`
- `filter.location.query`
- `signal.location.query`
- `filter.tags`
- `filter.results.entities`
- `feature.explainability`

Only use parameters on entity types that officially support them.

Relevant entity categories may include artists, brands, places, and supported cultural destinations.

Use `feature.explainability=true` when supported and useful.

**Analysis Compare**

Consider the documented Qloo comparison endpoint as an advanced capability, but verify actual access and response suitability before making it a required dependency.

### Critical Qloo integration rules

1. Never invent an API response or Qloo entity.
2. Never treat a missing response as a successful recommendation.
3. Do not average affinity values across differently normalized query contexts.
4. Do not interpret affinity as the probability of ticket purchases, attendance, sales, or personal satisfaction.
5. Keep actual Qloo evidence separate from model-generated interpretation.
6. Record query context and evidence provenance.
7. Validate returned IDs against expected entity types.
8. Apply timeouts and bounded retries.
9. Handle HTTP 400, 401, 403, 429, and 5xx responses.
10. Protect credentials and comply with Qloo usage and data-retention terms.
11. Do not assume that independent local vendors have a direct Qloo representation.
12. Label vendor cultural profiles derived from known brands or interests as proxies.
13. Preserve source and mode labels for live, cached, replayed, and simulated data.

### Mandatory Qloo feasibility experiment

Before building the complete product, conduct tests involving approximately 20 candidate profiles across two relevant markets.

Use real Qloo data where authorized credentials are available.

Evaluate:

- Artist entity coverage.
- Brand and place coverage.
- Tag coverage.
- Entity-resolution ambiguity.
- Cross-domain affinity relevance.
- Sensitivity to changed cultural inputs.
- Query latency and errors.
- Explainability availability.
- Candidate ranking differences.
- The quality of data for independent vendor proxies.

Create a feasibility report.

If cultural signals are too weak to materially improve the event planning workflow, narrow the implementation to validated data types and document the decision.

Do not build the entire product on unverified API assumptions.

## 4.2 LLM API

Use a supported LLM provider with structured tool-calling capabilities.

Possible providers include OpenAI, Anthropic, Google Gemini, or another compatible service for which credentials are available.

The LLM must:

- Interpret organizer instructions.
- Select allowed tools.
- Identify missing information.
- Propose bounded investigation steps.
- Explain structured evidence.
- Summarize tradeoffs.
- Produce readable reports.

The LLM must not:

- Generate arbitrary affinity scores.
- Override hard constraint checks.
- Invent artist availability.
- Assume booking prices.
- Certifiy food safety.
- Invent Qloo entity IDs.
- Apply unapproved event changes.
- Claim that a physical layout satisfies regulatory requirements without independent verification.

Use structured schemas and reject invalid model output.

## 4.3 Supabase

Use Supabase for:

- PostgreSQL persistence.
- Organizer authentication.
- Event ownership.
- Saved recovery cases.
- Evidence references.
- Scenario history.
- Approved event plans.
- Optional uploaded floorplan assets.

Never place privileged database credentials in the browser.

## 4.4 Geographical and mapping services

Qloo supplies cultural and locality intelligence where supported.

For the physical stall layout, build an internal SVG spatial editor. It does not require Google Maps or Mapbox.

If real-world geographic visualization materially improves the product, consider OpenStreetMap with an appropriately licensed mapping library.

External geocoding is optional and must respect provider policies.

Do not confuse a geographic map with the venue's actual floorplan.

## 4.5 Development tooling and plugins

Use available integrations when authorized:

- GitHub connector or GitHub CLI for repository management.
- GitHub Actions for CI.
- Vercel integration or CLI for deployment.
- Railway integration or CLI if a long-running Node process is required.
- Supabase CLI for database migrations and local configuration.
- Browser automation with Playwright for end-to-end QA.
- Postman, Bruno, or another API client for testing Qloo contracts.
- Official Qloo OpenAPI specification for request validation.
- shadcn CLI for UI components.
- pnpm for dependency management.
- Git for source control.
- Docker only where needed for reproducible development or deployment.

MCP servers and AI coding plugins are optional development aids, not dependencies the deployed application should require.

Do not install additional tools simply to increase the number of technologies listed in the submission.

Do not claim a plugin, account, API subscription, or deployment connection exists until verified.

---

# PHASE 5: SOFTWARE ARCHITECTURE

Create a modular system with explicit boundaries.

## Application modules

1. Event Management
2. Cultural Entity Resolution
3. Audience Context
4. Qloo Intelligence
5. Programme Composition
6. Vendor and Performer Management
7. Spatial Allocation
8. Constraint Validation
9. Agent Orchestration
10. Disruption Recovery
11. Scenario Comparison
12. Approval and Revision History
13. Evidence and Reporting
14. Authentication and Access Control
15. Evaluation and Observability

Separate domain rules from UI components, database access, model prompts, and external API clients.

## Proposed project structure

`src/app` for pages, layouts, and route handlers.

`src/components` for reusable interface components.

`src/features` for product-specific UI and interactions.

`src/domain` for domain types, invariants, constraints, and decision rules.

`src/server` for server-only services and orchestration.

`src/integrations/qloo` for Qloo requests and response normalization.

`src/integrations/llm` for model adapters and tool schemas.

`src/optimizer` for constrained allocation and scenario evaluation.

`src/evidence` for provenance and grounded explanation validation.

`src/lib` for shared utilities.

`prisma` for database schema, migrations, and seed data.

`tests` for unit, integration, contract, and scenario evaluations.

`docs` for architecture, API evidence, evaluation, security, and submission notes.

Adapt exact folder names if a clearer architecture is justified.

## Persistence model

Design normalized entities for:

- User
- Organization or owner context
- Event
- EventVenue
- EventZone
- Stall
- Performer
- Vendor
- VendorOffering
- LineupSlot
- EventSchedule
- CulturalEntity
- CulturalInterest
- AudienceContext
- EventConstraint
- EventPlan
- PlanRevision
- Assignment
- Disruption
- RecoveryCase
- RecoveryRun
- Candidate
- CandidateAssessment
- EvidenceRecord
- Approval
- RecoveryReport
- AuditEvent

Include timestamps, foreign keys, ownership boundaries, status fields, and useful indexes.

Use stable IDs and schema migrations.

Approved event plans must be versioned and immutable.

New changes must produce a new revision rather than silently overwriting the previously approved plan.

Store Qloo provenance with a sensible, terms-compliant retention strategy. A reference to an external response does not guarantee future availability.

---

# PHASE 6: DESIGN THE CORE INTELLIGENCE

## 6.1 Event cultural fingerprint

Develop a cultural representation for each event using:

- Resolved participating artists.
- Supported brand and place entities.
- Explicit audience interests.
- Organizer-selected event themes.
- Verified cultural tags.
- Event location where relevant and supported.

Keep each signal's origin clear.

Distinguish:

- Observed facts.
- Organizer-entered information.
- Qloo-reported data.
- Qloo-derived relationships.
- Inferred cultural proxies.
- Missing or unsupported information.

Never imply that the system has access to real ticket-buyer preferences unless the organizer legitimately supplies relevant aggregated data.

## 6.2 Cultural Continuity Engine

Create a documented metric to evaluate how a changed programme differs from an approved reference programme.

The metric should use grounded and reproducible evidence, such as:

- Within-context candidate ranks.
- Changes in supported cultural tag coverage.
- Shifts in the relative representation of organizer-selected interests.
- Retention of supported cultural relationships.
- Tradeoffs between familiarity and exploration.
- Coverage of different voluntarily supplied interest groups.

It must not be presented as an official Qloo score.

Do not compare raw affinity values from incompatible requests.

Where possible, score alternatives against the same fixed candidate set and query context.

For comparisons using different input contexts, use explicitly documented relative-rank or vector methods and report their limitations.

Provide a mathematical specification, implementation tests, and sensitivity checks.

Do not use unexplained arbitrary percentages.

## 6.3 Hard constraints

Examples:

- Stall width and depth.
- Physical zone eligibility.
- Electricity requirements.
- Permitted vendor categories.
- Organizer-defined exclusions.
- Confirmed vendor availability.
- Confirmed performer availability.
- Budget limits with known prices.
- Locked positions.
- Schedule conflicts.
- Minimum spacing rules explicitly provided by the organizer.

Hard constraints must never be overridden by cultural preference scores.

Unknown availability or pricing must remain unknown.

Never infer that a layout is legally approved or safe merely because it meets the supplied planning rules.

## 6.4 Soft optimization objectives

Examples:

- Cultural relevance.
- Balanced category representation.
- Complementary experiences.
- Minimized changes after disruption.
- Fair consideration of multiple stated interests.
- Preserving programme identity.
- Keeping related experiences together where useful.
- Exploring culturally relevant alternatives.

Create an explainable, versioned optimization function.

Weighting must be adjustable and tested.

Avoid optimizing for predicted sales or attendance without real outcome data.

## 6.5 Spatial optimization

Implement a deterministic vendor-to-stall allocation engine.

Requirements:

- Unique vendor-to-stall assignments.
- No double-booking.
- Respect known space and infrastructure restrictions.
- Support fixed or locked placements.
- Support available and unavailable stalls.
- Detect infeasible assignments.
- Show unallocated vendors.
- Produce alternative valid solutions where possible.
- Minimize unnecessary relocation during recovery.

For small cases, begin with a feasibility-first allocation algorithm and bounded local search.

Consider integer programming only if measured complexity warrants it.

Test tiny cases against exhaustive search to verify correctness.

Do not build a complex global optimizer if a simpler solution handles the hackathon scenarios reliably.

---

# PHASE 7: BUILD THE AGENTIC SYSTEM

Create one bounded orchestration layer rather than numerous loosely coordinated AI agents.

## Agent responsibilities

The agent should:

1. Understand the organizer's requested outcome.
2. Read the current event plan.
3. Identify unresolved cultural entities.
4. Call Qloo tools for relevant evidence.
5. Detect missing operational information.
6. Discover candidates.
7. Ask the deterministic planner for feasible alternatives.
8. Investigate tradeoffs between alternatives.
9. Request additional evidence when necessary.
10. Generate an evidence-backed recommendation.
11. Submit the proposal for approval.
12. Reassess the plan when the organizer changes constraints.

## Recommended agent tools

Define typed tools such as:

- `resolve_cultural_entity`
- `search_cultural_tags`
- `get_cultural_insights`
- `compare_cultural_contexts`
- `get_event_plan`
- `get_event_constraints`
- `find_replacement_candidates`
- `validate_hard_constraints`
- `generate_feasible_allocations`
- `evaluate_cultural_continuity`
- `compare_plan_revisions`
- `inspect_evidence`
- `propose_recovery_plan`
- `prepare_approval_request`
- `generate_recovery_report`

Every tool must have validated inputs, bounded outputs, execution limits, and errors handled explicitly.

The model must not invoke privileged functions outside its approved tool registry.

## Recovery workflow states

- Draft
- Validating
- Resolving
- Investigating
- Evaluating
- Proposal ready
- Awaiting approval
- Approved
- Rejected
- Needs information
- Failed

Implement valid state transitions and prevent invalid state mutations.

Assign each run a unique ID and idempotency mechanism.

Do not allow an old or duplicated run to overwrite a newer approved plan.

## Human approval

All material event changes require organizer approval.

This includes:

- Changing a performer.
- Assigning a new vendor.
- Removing an approved participant.
- Moving locked vendors.
- Modifying a schedule.
- Applying a revised event plan.

Approval must be linked to a specific immutable proposal version.

If the underlying plan changes, require revalidation before approval.

---

# PHASE 8: DISRUPTION RECOVERY WORKFLOWS

Implement a complete disruption engine.

## Workflow A: Performer cancellation

The organizer selects a performer who has withdrawn.

MEND should:

1. Identify the vacated programme slot.
2. Inspect the remaining performers.
3. Evaluate the existing cultural context.
4. Resolve relevant artists through Qloo.
5. Discover culturally compatible alternatives.
6. Compare the alternatives with the intended audience context.
7. Apply available scheduling and budget information.
8. Preserve locked event commitments.
9. Rank feasible or conditionally feasible candidates.
10. Show evidence and remaining booking checks.
11. Request organizer approval.

Do not automatically book an artist.

## Workflow B: Vendor withdrawal

When a vendor exits:

1. Mark the affected vendor slot.
2. Identify its category and verified offerings.
3. Identify relevant cultural context.
4. Inspect approved reserve vendors.
5. Evaluate suitable replacements.
6. Apply physical-space and category constraints.
7. Calculate feasible alternatives.
8. Reassign only what is necessary.
9. Explain the proposed changes.
10. Await approval.

## Workflow C: Loss of physical space

When stalls or zones become unavailable:

1. Identify affected assignments.
2. Preserve unaffected locked arrangements.
3. Determine vendors needing relocation.
4. Revalidate dimensions, power, and location restrictions.
5. Search for feasible reassignment.
6. Produce one or more valid plans.
7. Report capacity shortfalls when necessary.
8. Compare disruption magnitude.
9. Await approval.

## Workflow D: Food offering unavailable

Build a limited, honest recovery capability.

An organizer marks a menu item or food experience as unavailable.

The system should:

1. Identify the affected vendor and offering.
2. Read the vendor's actual list of available alternatives.
3. Enforce supplied ingredient, allergen, and service restrictions.
4. Investigate Qloo cultural relevance where supported.
5. Propose viable alternatives.
6. Explain cultural and operational tradeoffs.
7. Require human confirmation.

Do not invent ingredients, substitutes, preparation requirements, or nutritional facts.

If Qloo cannot provide meaningful dish-level information, keep this as a constrained, organizer-data workflow and state clearly that its cultural intelligence is limited.

## Workflow E: Audience-interest balancing

Allow organizers to supply multiple sets of cultural interests.

Investigate whether the event provides culturally relevant options across these interests.

Provide:

- Interest-coverage summaries.
- Conflicting preference analysis.
- Alternative programme combinations.
- Transparent tradeoffs.
- Warnings about insufficient information.

Avoid demographic stereotyping or unsupported claims about identity groups.

---

# PHASE 9: FRONTEND PRODUCT AND UI/UX

Design MEND as a premium, responsive, distinctive operational product.

Avoid generic dashboard templates, meaningless graphs, excessive glass effects, ornamental AI animations, and interfaces that resemble unfinished admin panels.

## Design direction

Visual personality:

- Contemporary.
- Elegant.
- Precise.
- Confident.
- Culturally expressive.
- Designed for professional event operators.

Proposed design tokens:

- Background: `#101418`
- Elevated surface: `#1C232A`
- Secondary surface: `#29323A`
- Primary accent: `#D7F17D`
- Secondary accent: `#A2A8E8`
- Main text: `#F4F6F2`
- Secondary text: `#AAB4BE`
- Warning: `#D9A16D`
- Error: `#E58885`

Test accessibility and adjust actual contrast ratios before finalizing these values.

Use a clean interface typeface and an expressive but readable heading typeface.

Prefer subtle radii, intentional whitespace, strong data hierarchy, polished micro-interactions, and contextual animation.

## Branding

Create a distinctive wordmark for MEND and a separate recognizable icon.

Explore a visual motif involving a broken path, connected pieces, repaired geometry, or restored alignment.

The identity should communicate continuity, intelligence, and repair without using generic robot symbols.

Create reusable brand components, favicon, social preview, and light/dark-compatible assets where needed.

## Main application routes

### `/`

Public landing page.

Include:

- Strong product promise.
- Compelling interactive product preview.
- Real explanation of the problem.
- Visual planning and recovery demonstration.
- Qloo-powered intelligence explanation.
- Sample scenario entry point.
- Clear navigation and call to action.

No unsupported performance claims.

### `/demo`

Public, judge-ready sample event.

A visitor should be able to explore and complete the core workflow without creating an account.

Use real Qloo calls where credentials are available and clearly label any fixture or replay mode.

Never disguise simulated results as live.

### `/events`

Organizer event list.

Include event status, date, location, last updated time, and available actions.

### `/events/new`

Event creation workflow.

Include event details, venue, programme, audience interests, basic constraints, and optional sample data.

### `/events/[id]/studio`

Main event design workspace.

Include:

- Visual event programme.
- Performers.
- Vendors.
- Stall layout.
- Cultural profile.
- Constraints.
- Plan editing.
- Locking and unlocking placements.
- Agent recommendations.

### `/events/[id]/scenarios`

Scenario Lab.

Allow organizers to introduce disruptions and compare proposed recoveries.

### `/events/[id]/decisions`

Decision Desk.

Show:

- Candidate evaluations.
- Qloo evidence.
- Constraint checks.
- Agent reasoning summaries.
- Proposal status.
- Approval controls.
- Revision history.

### `/events/[id]/reports`

Persistent recovery reports and downloadable summaries where practical.

### `/settings`

Basic organizer settings, data preferences, and connected-service information.

Do not make unused navigation entries or placeholder pages.

## Core UI components

Build reusable components including:

- Event cards.
- Performer cards.
- Vendor cards.
- Cultural interest chips.
- Qloo entity resolver.
- Venue zone editor.
- Stall layout editor.
- Assignment inspector.
- Disruption selector.
- Cultural evidence panel.
- Constraint validation panel.
- Candidate comparison cards.
- Recovery timeline.
- Agent activity timeline.
- Approval dialog.
- Before-and-after comparison.
- Report viewer.
- Empty, loading, error, and retry states.

## Floorplan Studio

Make the floorplan the most distinctive interaction.

Requirements:

- Pan and zoom on desktop.
- Tap and inspect on mobile.
- Keyboard-accessible selection and editing.
- Drag or assign vendors to valid stalls.
- Visualize assigned, empty, blocked, and locked spaces.
- Highlight constraint conflicts.
- Show changes between plan revisions.
- Undo uncommitted edits.
- Preserve confirmed approved plans.
- Support accessible alternatives to drag-and-drop.

Use a simple, explicit event-space model rather than pretending to provide a professional architectural or fire-safety floorplan.

## Animation

Use Motion for React and CSS transitions for:

- Smooth navigation.
- Subtle card interactions.
- Expanded evidence panels.
- Candidate swaps.
- Highlighting changed stalls.
- Agent progress transitions.
- Before-and-after scenario changes.

Respect `prefers-reduced-motion`.

Do not animate every element continuously.

## Accessibility

Target WCAG 2.2 AA where feasible.

Test keyboard navigation, screen-reader labels, contrast, dialog focus management, mobile touch targets, and error announcements.

---

# PHASE 10: APPLICATION API CONTRACTS

Design and document internal application endpoints.

Suggested routes:

### Event management

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `PATCH /api/events/:id`

### Participants and cultural interests

- `POST /api/events/:id/participants`
- `PATCH /api/events/:id/participants/:participantId`
- `POST /api/culture/resolve`
- `POST /api/culture/insights`

### Plans

- `GET /api/events/:id/plans`
- `POST /api/events/:id/plans/generate`
- `GET /api/events/:id/plans/:planId`

### Disruptions and recovery

- `POST /api/events/:id/disruptions`
- `POST /api/events/:id/recovery-runs`
- `GET /api/recovery-runs/:runId`
- `GET /api/recovery-runs/:runId/evidence`

### Approvals

- `POST /api/plans/:planId/approve`
- `POST /api/plans/:planId/reject`

### Reporting

- `GET /api/events/:id/reports`
- `GET /api/reports/:reportId`

### Demo and health

- `GET /api/health`
- `GET /api/demo/scenarios`
- `POST /api/demo/run`

Treat these as proposed application route names, not externally provided APIs.

Use Zod schemas and consistent structured errors.

Support safe retries, authorization, pagination where necessary, and idempotency on state-changing operations.

Keep Qloo and privileged model credentials inaccessible to the browser.

---

# PHASE 11: DATA VALIDITY, SECURITY AND RELIABILITY

Implement:

- Input validation.
- Authentication and ownership checks.
- Secure session management.
- Server-only API secrets.
- Strict environment variable handling.
- HTTP request timeouts.
- Bounded retries with backoff and jitter.
- Rate limiting.
- Qloo request concurrency limits.
- Database transaction boundaries.
- Sanitized logs.
- Sensitive data redaction.
- Content Security Policy where practical.
- Error boundaries.
- Meaningful fallback states.
- Dependency auditing.
- API usage monitoring.
- Prompt-injection-resistant tool boundaries.
- Strict separation of model text and executable commands.

Do not send private organizer documents or identifying attendee data to Qloo unnecessarily.

Avoid collecting personally identifiable attendee profiles.

Evaluate cache retention against the provider's terms before storing Qloo responses.

If required services are unavailable, do not silently replace them with fabricated data.

Build a clearly labeled demonstration mode with traceable authorized fixtures.

---

# PHASE 12: ENGINEERING THE DEMONSTRATION

Create one polished sample event specifically designed for judges.

Working scenario:

**Midnight Culture Market**

Illustrative configuration:

- 12 vendor stalls.
- A pool of approximately 18 to 20 applicants.
- Three to five performers.
- Multiple cultural interests.
- A limited budget.
- A constrained venue layout.
- Several locked placements.
- An approved starting event plan.

Use culturally relevant, resolvable real Qloo entities for the demonstrated intelligence.

Independent vendors may be fictional organizer entries, but their fictional status must be clear. Any Qloo cultural references must be grounded in actually resolved entities.

### Judge walkthrough

Step 1: Open MEND.

Step 2: Enter the public sample event.

Step 3: Explore the original lineup and floorplan.

Step 4: Inspect the event's cultural context.

Step 5: Trigger a performer cancellation.

Step 6: Watch the agent investigate alternatives.

Step 7: Compare candidates using evidence.

Step 8: View a proposed replacement.

Step 9: Trigger a vendor withdrawal or stall closure.

Step 10: Watch the allocation engine repair the event.

Step 11: Inspect cultural and operational tradeoffs.

Step 12: Approve a valid proposed revision.

Step 13: Review the before-and-after plan.

Step 14: Open the evidence-backed recovery report.

The demo should be comprehensible to someone who has never used MEND.

Do not require a long tutorial, special credentials, paid account, or local installation.

Include explanatory guidance, but avoid overwhelming the judge with technical terminology.

---

# PHASE 13: EVALUATION AND PROVABILITY

Create a dedicated evaluation module.

The most important question is whether Qloo materially improves the decisions made by MEND.

Do not evaluate MEND only against itself.

## Required baselines

### Baseline A: Rules-only planner

Uses operational constraints and declared categories without Qloo cultural intelligence.

### Baseline B: LLM-assisted planner without Qloo

Uses the same event input and operational restrictions, but no Qloo access.

### System C: MEND with Qloo

Uses the same scenario, constraints, and available candidate pool, plus Qloo cultural evidence.

Where possible, run an additional fixed-candidate experiment that isolates ranking quality from candidate discovery.

## Test scenarios

Create approximately 15 to 20 realistic planning and disruption scenarios.

Cover:

- Performer cancellations.
- Vendor exits.
- Stall closures.
- Conflicting constraints.
- Insufficient available candidates.
- Unresolvable cultural entities.
- Changed audience interests.
- Multiple alternative arrangements.
- Missing booking information.
- Events with intentionally weak Qloo coverage.

## Technical metrics

Measure:

- Qloo entity-resolution success.
- Unsupported entity rate.
- API request success and error distribution.
- Evidence coverage.
- Unsupported claim rate.
- Confirmed hard-constraint violations.
- Runtime and request volume.
- Reproducibility of deterministic ranking.
- Plan stability.
- Number of unrelated assignments changed during recovery.
- Scenario completion rate.

## Product impact metrics

Measure where practical:

- Time required to complete a planning scenario.
- Time to generate a feasible recovery proposal.
- Organizer task completion.
- Organizer assessment of recommendation relevance.
- Perceived usefulness of the evidence panel.
- Whether alternatives satisfy the actual event brief.

Seek feedback from real event organizers if possible.

Do not invent testimonials, evaluation participants, or business impact.

## Evidence integrity

Each factual cultural explanation must reference the evidence record that supports it.

Build an automated grounding validator that rejects unsupported claims.

If explainability data is unavailable, show the limitation.

Do not fabricate an apparent score improvement.

Do not compare normalized Qloo scores across incompatible queries as though they are absolute measurements.

Save actual benchmark outcomes to a documented results file.

Include unfavorable results and unresolved limitations.

## Tests

Implement:

- Unit tests for constraint logic.
- Unit tests for ranking.
- Exhaustive small-case optimizer verification.
- Qloo contract tests using validated response fixtures.
- Model tool-schema tests.
- Prompt-injection and malformed-response tests.
- Authorization tests.
- Persistence and revision-history tests.
- Concurrent approval tests.
- End-to-end scenario tests.
- Accessibility checks.
- Mobile responsive tests.
- Production smoke tests.

Create a reproducible test command documented in the README.

---

# PHASE 14: IMPLEMENTATION MILESTONES

Do not start by building all pages at once.

Work through the following gates and produce functioning, tested deliverables.

## Milestone 0: Repository and engineering foundation

- Inspect any existing authorized MEND repository.
- Otherwise initialize a dedicated MEND repository.
- Set up Next.js, TypeScript, styling, package management, and linting.
- Create architecture documentation.
- Configure environment validation.
- Establish GitHub Actions.
- Add an open-source license.
- Create initial database schema and migrations.
- Establish code quality conventions.

Exit criterion: Clean install, typecheck, lint, and tests run successfully.

## Milestone 1: Qloo feasibility

- Request or configure authorized API access.
- Test the official Qloo endpoints.
- Validate entity and tag resolution.
- Test artist, brand, and place coverage.
- Record response schemas.
- Analyze cultural signal sensitivity.
- Validate explainability.
- Produce a feasibility report.

Exit criterion: A defensible cultural intelligence use case is demonstrated using actual Qloo evidence.

Do not proceed blindly if this fails.

## Milestone 2: Core data model

- Implement events.
- Implement venues and zones.
- Implement participants.
- Implement stalls and assignments.
- Implement audience interests.
- Implement constraints.
- Implement plan revisions.
- Add validated seed data.

Exit criterion: Events and plans can be created, read, updated, and persisted without data corruption.

## Milestone 3: Event planning engine

- Implement hard constraints.
- Build allocation logic.
- Add vendor assignment.
- Add performer scheduling data.
- Add plan generation.
- Add conflict detection.
- Add infeasibility reporting.

Exit criterion: The planner produces valid allocations for the defined test scenarios.

## Milestone 4: Qloo cultural engine

- Implement entity resolution.
- Build normalized Qloo adapters.
- Implement cultural interest profiles.
- Implement candidate discovery.
- Develop the continuity analysis.
- Implement evidence storage and references.
- Connect Qloo intelligence to planning.

Exit criterion: Removing or altering Qloo signals produces measurable, explainable differences in at least some validated cases.

## Milestone 5: Agentic orchestration

- Implement typed tools.
- Implement state transitions.
- Build bounded decision workflows.
- Add retries and recovery.
- Add evidence validation.
- Add structured explanations.
- Add approval requests.

Exit criterion: An agent completes a recovery proposal without bypassing deterministic safeguards.

## Milestone 6: Product interface

- Design system and branding.
- Landing page.
- Demo page.
- Event setup.
- Event Studio.
- Vendor pool.
- Floorplan.
- Scenario Lab.
- Decision Desk.
- Evidence inspector.
- Recovery reports.

Exit criterion: All navigation and primary controls work end to end, with appropriate responsive, loading, empty, and error states.

## Milestone 7: Recovery workflows

Complete and test:

- Performer replacement.
- Vendor replacement.
- Stall reallocation.
- Approval-based plan repair.
- Before-and-after comparison.
- Multi-interest cultural evaluation.
- Limited menu-offering substitution if the validated integration supports it.

Exit criterion: The public demo can execute its full recovery scenario.

## Milestone 8: Benchmarking

- Build baseline approaches.
- Run controlled tests.
- Save factual results.
- Investigate regressions.
- Improve weak logic.
- Test evidence grounding.
- Assess product usefulness.

Exit criterion: The advantages and limitations of Qloo-powered MEND are documented with reproducible evidence.

## Milestone 9: Security and production QA

- Validate authorization.
- Test API error recovery.
- Audit dependencies.
- Check API key exposure.
- Test slow or unavailable external services.
- Test mobile UX.
- Test accessibility.
- Run end-to-end regression tests.
- Verify production environment variables.

Exit criterion: No known critical security, persistence, or end-to-end workflow defects.

## Milestone 10: Deployment

- Connect the production database.
- Apply migrations.
- Configure secrets.
- Deploy the application.
- Test fresh and returning sessions.
- Verify Qloo access from the deployed environment.
- Confirm public demo accessibility.
- Run production smoke tests.
- Confirm all required routes work.

Exit criterion: A judge can open the production URL and complete the primary workflow.

## Milestone 11: Submission readiness

Complete:

- Public repository.
- Appropriate LICENSE file.
- Professional README.
- Architecture overview.
- API integration documentation.
- Sample environment configuration.
- Reproducible setup instructions.
- Testing documentation.
- Qloo evidence report.
- Benchmark results.
- Product screenshots.
- Demo walkthrough script.
- Hackathon submission description.
- A list of limitations and future work.

Exit criterion: All official hackathon submission requirements are met and independently checked.

---

# PHASE 15: RELEASE PRIORITIES

Protect the core experience against scope creep.

## P0: Non-negotiable

- Genuine Qloo integration.
- Event creation.
- Cultural context construction.
- Functional vendor and performer data.
- Constraint validation.
- Feasible spatial allocation.
- Performer cancellation recovery.
- Vendor withdrawal recovery.
- Stall closure recovery.
- Agentic tool orchestration.
- Evidence-backed explanations.
- Human approvals.
- Before-and-after event comparison.
- Public demo.
- Persistent plans.
- Automated tests.
- Live deployment.
- Public licensed repository.

## P1: Important

- Multiple planning modes.
- Audience-interest balancing.
- Advanced cultural continuity analysis.
- Interactive scenario comparison.
- Comprehensive reports.
- Refined agent activity timeline.
- Menu-offering substitutions with known inventory.
- Additional optimization strategies.
- Strong benchmark presentation.

## P2: Post-hackathon

- Real artist booking.
- Vendor contracts.
- Payments.
- Ticketing.
- Automated outbound communication.
- Detailed permit management.
- Multi-organization collaboration.
- Advanced geographic planning.
- Predictive attendance modeling.
- Native mobile application.
- Large-scale multi-event operations.

Complete P0 before spending major engineering time on P2.

P1 features should be delivered only when they do not jeopardize the core workflow.

---

# PHASE 16: COMPETITIVE PRODUCT EVALUATION

Build an internal scorecard aligned with the four official judging categories.

## Technical implementation: 25 points

Evaluate:

- Depth of Qloo integration.
- Validated API access.
- Grounded cultural decisions.
- Meaningful agent behavior.
- Deterministic safeguards.
- Reliability.
- Testing.
- Reproducibility.

## Product design: 25 points

Evaluate:

- Visual identity.
- Interface quality.
- Product coherence.
- End-to-end usability.
- Interaction design.
- Mobile support.
- Accessibility.
- Error handling.
- Completion of user journeys.

## Credible impact: 25 points

Evaluate:

- Specific problem definition.
- Clear target user.
- Practical workflow.
- Demonstrated usefulness.
- Meaningful evaluation.
- Realistic operational constraints.
- Honest limitations.
- Potential for adoption.

## Quality of idea: 25 points

Evaluate:

- Originality.
- Non-obvious use of Qloo.
- Strength of the underlying insight.
- Differentiation from existing competitors.
- Cultural intelligence as a genuine necessity.
- Depth of domain understanding.

Treat the scoring as an internal evaluation model, not an official prediction of judge scores.

Critically review MEND against public comparable projects, including Qloo-related event planning, programme repair, artist scouting, and constrained placement products.

Do not copy another project's branding, code, interface, or proprietary materials.

---

# PHASE 17: DOCUMENTATION AND DEVELOPER EXPERIENCE

Create professional documentation.

Required files include:

- `README.md`
- `LICENSE`
- `.env.example`
- `CONTRIBUTING.md`
- `docs/architecture.md`
- `docs/product-spec.md`
- `docs/qloo-integration.md`
- `docs/cultural-continuity.md`
- `docs/agent-workflow.md`
- `docs/data-model.md`
- `docs/constraint-engine.md`
- `docs/evaluation.md`
- `docs/security.md`
- `docs/deployment.md`
- `docs/demo-guide.md`
- `docs/limitations.md`
- `docs/submission.md`

Adjust filenames if necessary, but ensure the information is complete.

The README should explain:

1. The problem.
2. The solution.
3. Who MEND serves.
4. What makes the product distinctive.
5. How Qloo is used.
6. How the agent works.
7. The architecture.
8. The actual implemented features.
9. How to run the application locally.
10. Required environment variables.
11. How to run tests.
12. How to reproduce the demo.
13. The deployment link.
14. The evidence and benchmark documentation.
15. Known limitations.
16. The open-source license.

Do not describe planned features as already implemented.

---

# PHASE 18: FINAL QUALITY GATES

Before declaring MEND complete, verify the following.

## Functionality

- A new organizer can create an event.
- A sample visitor can open the judge demo.
- Cultural entities are resolved using real Qloo results.
- Candidate recommendations are grounded in returned evidence.
- Vendors can be assigned to stalls.
- Constraint conflicts are visible.
- Approved plans are versioned.
- Performer cancellation produces a real recovery proposal.
- Vendor withdrawal can trigger reallocation.
- Space loss triggers a valid repair or explicit infeasibility result.
- The organizer can compare options.
- Approval applies only a validated proposal.
- Reports accurately reflect approved state.

## Engineering

- TypeScript passes.
- Lint passes.
- Production build succeeds.
- Tests pass.
- Database migrations work.
- Secrets are protected.
- API limits are respected.
- Critical errors are handled.
- State changes are auditable.
- Duplicate submissions are safe.
- Deployed API calls work.

## Design

- No dead buttons.
- No unfinished visible navigation.
- No broken mobile layouts.
- No inaccessible critical interactions.
- No meaningless filler metrics.
- No invented data presented as live.
- No distracting animation.
- No unexplained rankings.
- No unreadable charts.
- No unresolved critical interface bugs.

## Submission

- Public deployment works.
- Public repository is accessible.
- LICENSE is present.
- README is accurate.
- Setup instructions are reproducible.
- Qloo contribution is clearly demonstrated.
- Judges can test the main workflow for free.
- A final regression and smoke test has passed.

---

# PHASE 19: WORKING METHOD AND REPORTING

Engineer MEND milestone by milestone while continuously preserving a functioning product.

At the end of every completed milestone:

1. Summarize what was implemented.
2. List important files changed.
3. State tests actually executed.
4. Show real test results.
5. State API operations actually verified.
6. Identify remaining risks.
7. Explain relevant architectural decisions.
8. Commit coherent, tested changes when repository access permits.
9. Update progress documentation.
10. Identify the next milestone.

Do not mark a feature complete based only on source code existing.

A feature is complete when it is integrated, tested, and functioning in its intended user workflow.

If a service is inaccessible, report the blocker and distinguish completed implementation from unverified integration.

Never fabricate a deployment URL, API response, test result, external account connection, or successful push.

Work independently through authorized implementation tasks, without unnecessary confirmation at every step.

Request input only when a missing credential, permission, financially consequential action, or material architectural decision genuinely requires the owner's involvement.

Keep the engineering priorities aligned with the deadline.

---

# PHASE 20: FINAL PRODUCT STANDARD

MEND should feel like a cohesive product designed by an experienced team, with a rigorous engineering foundation.

The product must have a distinctive visual identity, a strong central interaction, functional workflows, and inspectable cultural reasoning.

Its defining demonstration should show an organizer taking an approved cultural event, experiencing a meaningful disruption, and using the agent to construct a valid recovery proposal.

The judge should be able to see:

- The original plan.
- The disruption.
- The agent's investigation.
- Qloo's actual contribution.
- The operational constraints.
- The candidates considered.
- The proposed repair.
- The explanation.
- The human approval.
- The final revised plan.

The technical architecture should make the product reliable.

The visual design should make it memorable.

The evidence should make it credible.

The user experience should make it easy to understand.

Do not optimize for an impressive list of tools. Optimize for an unusually good product whose central decision genuinely depends on Qloo.

## First execution instructions

Before writing application code:

1. Verify the current hackathon requirements.
2. Read the official Qloo OpenAPI specification.
3. Inspect the available development environment, authorized services, and existing repository.
4. Confirm access to the required credentials.
5. Identify unverified API assumptions.
6. Produce a technical feasibility checklist.
7. Define a practical initial event scenario.
8. Establish the architecture, domain model, testing strategy, and milestone sequence.

Then begin implementation at Milestone 0 and proceed through the gates in order.

If Qloo credentials are unavailable, implement and test the adapter against clearly marked recorded or contract-valid fixtures, but do not claim a completed live integration. Make obtaining and validating live access an explicit blocking item before final submission readiness.

Build the simplest architecture that fully supports MEND's intended behavior.

Deliver a complete, functional, polished application, verified through code, tests, real API evidence, and an accessible production deployment.

**MEND's ultimate purpose: help organizers preserve the cultural integrity and operational feasibility of an event when its plans change.**

Make every engineering, product, design, and evaluation decision serve that purpose.
