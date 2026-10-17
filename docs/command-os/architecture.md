# MENWA UNJ Command OS — local stage 1 and proposed production architecture

Status: **local stage 1 implementation authorized; production design remains proposed, 18 October 2026**. The approved local slice is the Link Registry. Managed database, storage, model execution and production deployment are not established by this document. Approval of source changes and production publication remain separate decisions under the supplied request, sections 8.3 and 14.

## 0. Approved local stage 1 boundary

The local implementation keeps React/Vite and uses a Vite development-server middleware backed by Node 24 `node:sqlite`. Persistent local data lives at `.command-os/command.sqlite`, outside `public/` and build output and excluded from Git. Individual local accounts are administered with `node scripts/command-admin.mjs`; there is no default shared administrator password or public account registration. Authentication uses HttpOnly sessions, CSRF validation and server-side RBAC. The requester and approving person must be different accounts.

The four canonical actions are `kc-registration`, `youth-spark-registration`, `kc-jersey-peserta`, and `kc-jersey-official`. `GET /api/public/actions` supplies `{actions:[{id,url,revision}]}` with positive integer revisions to migrated public buttons. Only the published projection is public. Production command/publication APIs return `503` until a production storage/auth adapter has actually been implemented and connected; the public website retains its existing approved source links as a fallback. Local publication changes local content, not the deployed website. A rollback is a new task requiring a new approval.

SQLite here is a single-host local validation store. It is **not production-ready shared persistence for Vercel**, a confidential institutional archive, or a substitute for managed authentication, backups and operational controls. [Operations](operations.md) describes the implemented local behavior and [migration](migration.md) describes the unexecuted production path. The production tables, RLS policies, agent capabilities, numbering and background jobs below are proposed expansion targets, not claims that stage 1 implements them.

## 1. Grounding in the active application

The active application is the repository root: `index.html` loads `src/main.jsx`, which loads `src/App.jsx`. It uses React 18, Vite 5, JavaScript, CSS/Tailwind, a small custom router, and Vercel-style `api/chat.js` and `api/search.js`. Preserve these entry points, the existing identity, routes, approved assets, and Bahasa Indonesia UI. `menwa-site/` is a separate copy; it must not become a second implementation target accidentally.

`src/data/siteData.js` already supplies programs, activities, institutional contacts, and several approved links. Action URLs also appear in `src/components/BrandExperience.jsx`, other JSX, and the chat prompt. `FEED_URL` is empty. Before stage 1, there was no database, authentication, object-storage client, durable task system, approval registry, or official numbering registry in the inspected active dependencies. The new local slice adds only its explicitly documented subset. Local browser preferences are not institutional storage.

The Gemini integration uses server environment variables, `GEMINI_API_KEY` and `GEMINI_MODEL`, and has deterministic navigation fallbacks. Reuse its server-only arrangement through a model adapter; do not repurpose the public navigation endpoint as an administrative command executor. Credential presence, provider quota, live model access, production Vercel access, and existing external accounts remain **unverified**. Do not copy secrets into a report or expose them through `VITE_*` variables.

## 2. Proposed production stack and boundaries

| Layer | Proposed choice | Reason and limit |
| --- | --- | --- |
| Public website | Existing React/Vite app | Avoid a framework rewrite; migrate individual content consumers after approval. |
| Internal UI | `/command-center` in the existing app | Indonesian commands, exact previews, task timeline, review and publication. UI visibility is not authorization. |
| API | Vercel Node handlers; TypeScript for new critical contracts | Verify authenticated identity and permissions on every command, write, approval, file request, and job action. Retain public navigation separately. |
| Database, identity, storage | Proposed Supabase PostgreSQL + invite-only Auth + private Storage | One managed service provides relational transactions, row policies, identities, and private files. Provider selection, region, retention, costs, and account access require confirmation before provisioning. |
| Long work | PostgreSQL job table + separately invoked worker | Start with bounded deterministic jobs; do not run OCR, large rendering, or agent loops in an HTTP request. Choose a worker host only when such work is enabled and its time limits are known. |
| Retrieval | PostgreSQL full-text search first | Add embeddings only if measured retrieval failures justify them. Apply permissions before retrieval and before citations. |
| AI | Existing Gemini behind `ModelProvider` | AI proposes structured operations. Deterministic validation and authorization decide execution. No provider receives confidential files without an explicit approved data policy. |

This recommendation reduces integration count; it is not a requirement to buy a particular vendor. An existing managed PostgreSQL provider + existing identity provider + S3-compatible private storage is equally acceptable if MENWA already operates them, with more configuration and permission boundaries to maintain. Repository-backed JSON is a useful public-content fallback but cannot provide safe concurrent letter numbering, private archives, or shared approvals. Local SQLite and browser storage are unsuitable as the shared production authority for Vercel functions.

Keep domain contracts (`Repository`, `ObjectStore`, `ModelProvider`, `JobRunner`, `Publisher`) small and provider-neutral. Do not introduce microservices, Kubernetes, a vector database, eight continuously running agents, or a second frontend framework for the first milestone.

Proposed request path:

```text
Authenticated command → structured draft → deterministic validation
  → immutable revision + exact preview → human approval
  → atomic publication → public read → independent verification + audit
```

Only the public read operation is anonymous. AI and worker identities have no direct publication, role-management, or official-issuance capability.

## 3. Link lifecycle and production acceptance target

The approved local Link Registry is small, useful, and establishes revision, approval, audit, and publication controls later needed for media and correspondence. Its actual supported commands, endpoints, URL-only edits and local permission model are in [operations](operations.md). The sequence below includes **proposed production expansion**, including scoped roles, operation expiry, activation schedules, remote URL checking and independent deployment verification; those are not all stage 1 features.

Example command: “Ganti tautan pendaftaran seminar Youth Spark menjadi [URL supplied by user].” Resolve it to the stable action key `youth-spark-registration`. If the action is ambiguous, show candidates; never guess a replacement URL or use a link found by the model as user authorization. Stage 1 uses deterministic Indonesian/English command recognition; a model is unnecessary for this narrow workflow.

1. An invited editor signs in and submits the command. The server creates a task and structured proposed change with `expected_revision`.
2. Validate the exact URL, allowed scheme/type, target slot, owner, activation dates, duplicates, and existing approved value. Preserve short links exactly; record redirects as verification metadata.
3. Show a preview with current/proposed label and destination, affected pages, validation results, verification limitations, schedule, revision number, and content digest. A preview is private and cannot change the public page.
4. An authorized human distinct from the requester approves that revision and exact operation (`publish_link`) for the stated environment. Editing any field creates a new revision and requires new approval.
5. The publish transaction checks current role, revision/digest, expiry, expected public version, and approval. It inserts a publication record, replaces the public projection, consumes the approval, and appends audit/task events atomically.
6. `/api/public/actions` returns only active published fields. The existing target button reads that record; non-migrated buttons keep their existing approved source. The API uses no confidential joins or arbitrary storage URLs. Set explicit cache policy and bound cache staleness; activation/expiry is evaluated server-side using UTC instants displayed as WIB.
7. Verify the public API and the rendered button against the publication ID and exact destination. Only then mark the task verified/completed. Publication success without read verification remains `PUBLISHING` or a recoverable failed verification, never falsely completed.

Proposed production domain operations: create command/task, read task, create immutable revision, read authorized preview, approve, publish, and read public actions. Preserve the implemented `/api/command/...` and `/api/public/actions` contracts where practical instead of exposing a second incompatible API. Confirm API precedence against the current catch-all rewrite in staging.

Writes require a verified session, server-side membership lookup, request size limits, schema validation, rate limits, origin/CSRF protections appropriate to the chosen session transport, and a caller-supplied idempotency key. Return `409` for stale revisions; do not silently overwrite another editor. Repeated keys with different payloads are rejected.

First implementation affects new API/domain modules, `/command-center`, the Link Registry data source, and selected link consumers in `siteData.js`/`BrandExperience.jsx`; it does not require redesigning the public portal. Stage 1 covers the four named actions. Import further links only after comparing exact current values and obtaining scope approval.

## 4. Proposed relational schema

This is the proposed **production** schema, not executable SQL or an applied migration. Local stage 1 uses the smaller SQLite schema described in [operations](operations.md); migration should map the existing audit/revision history rather than discard it. Later domains reuse the revision mechanism. Use UUID primary keys, `timestamptz`, UTC storage, foreign keys, and indexed scope/lookup columns. Rows are never implicitly trusted because their IDs are known.

| Table | Fields and essential constraints |
| --- | --- |
| `org_units` | `id`, `parent_id?` FK, `name`, `active`; validate parent cycles. Start with one approved MENWA scope. |
| `memberships` | `id`, `user_id` FK to Auth, `org_unit_id` FK, `role`, `active`, `created_by`, timestamps; unique `(user_id, org_unit_id, role)`. Roles never come from user-editable profile metadata. |
| `resources` | `id`, `org_unit_id` FK, `kind`, `key`, `current_revision_id?`, `published_revision_id?`, `created_by`, timestamps, `archived_at?`; unique `(org_unit_id, kind, key)`. M1 kind is `link`. Composite revision FKs enforce that both pointers belong to this resource. |
| `revisions` | `id`, `resource_id` FK, `revision_no`, `schema_version`, `payload`, `content_hash`, `base_revision_id?`, `created_by`, `created_at`; unique `(resource_id, revision_no)` and `(resource_id, id)`. Payload is validated against a closed schema for its kind; rows immutable. Hash canonical UTF-8 JSON with a versioned algorithm. |
| `tasks` | `id`, `org_unit_id`, `requested_by`, `intent`, `state`, `autonomy_level`, `target_revision_id?`, `idempotency_key`, `request_hash`, `error_code?`, timestamps; unique `(requested_by, idempotency_key)`. Transition only through authorized operations. |
| `task_events` | `id`, `task_id` FK, `sequence`, `from_state?`, `to_state`, `actor_id?`, `agent_id?`, `message_code`, redacted `details`, `created_at`; unique `(task_id, sequence)`, append-only. |
| `approvals` | `id`, `task_id`, `revision_id`, `content_hash`, `operation`, `environment`, `expected_published_revision_id?`, `requested_by`, `decided_by?`, `decision`, `expires_at`, `decided_at?`, `consumed_at?`; revision/task FKs, allowed decisions, no human impersonation. Only the server writes approver identity from the verified session. |
| `publications` | `id`, `resource_id`, `revision_id`, `previous_revision_id?`, `approval_id` FK, `environment`, `published_by`, `published_at`, `verified_at?`, `rollback_of?`; unique `approval_id`; preserve history. |
| `published_actions` | `resource_id` PK, `publication_id` FK, `revision_id`, `label`, `page_path`, `slot_key`, `destination`, `link_type`, `active_from?`, `expires_at?`, `disabled_label?`; public-safe projection only. Unique `(page_path, slot_key)` for a single current button; check expiration after activation. |
| `audit_log` | `id`, `org_unit_id`, `actor_id?`, `agent_id?`, `task_id?`, `operation`, `target_id`, before/after revision IDs, `request_id`, `result`, redacted `details`, `created_at`; append-only for application roles; no secrets, raw credentials, or full confidential documents in details. |
| `jobs` — add when long work starts | `id`, `task_id`, `revision_id`, `kind`, `idempotency_key` unique, `payload_hash`, `state`, `attempts`, `max_attempts`, `run_after`, `lease_until?`, `lease_token?`, `worker_id?`, `last_error?`, timestamps. No arbitrary executable code in payload. |
| `resource_relations` — later | `from_revision_id`, `to_revision_id`, `relation_kind`, unique tuple, both revision FKs. Links an event to an exact asset/document revision and preserves provenance. |

Reserve revision numbers while holding the resource row lock; create revision and advance `current_revision_id` in one transaction. Do not use `MAX(revision_no)+1` without a lock. Hashes supplement immutable IDs; they do not replace authorization or database constraints.

Proposed revision payloads:

| Kind / phase | Required domain fields |
| --- | --- |
| `link` / M1 | `label`, `page_path`, `slot_key`, `destination`, `link_type` (`internal`, `https`, `pdf`, `whatsapp`, `email`), `owner_unit_id`, optional `active_from`, `expires_at`, `disabled_label`; check exact allowed internal routes, HTTPS URLs, structured WhatsApp/email formats, and length limits. Verification metadata records timestamp, outcome, redirect chain and limitation. |
| `event` / website automation | Name, description, category, start/end timezone, location, display priority, cover/gallery/action/document revision relations, provenance and effective dates. Publication comes from the published pointer, not a draft-supplied boolean. |
| `asset` / media | Original and derived object keys, MIME/signature, bytes, dimensions, checksum, alt text, provenance, processing method, confidentiality, retention, visual QA results. Preserve original; distinguish actual vectorization from raster wrapping. |
| `template` / secretariat | Category, source/version, unit, validity range, approval/supersession state, confidentiality, required fields, layout object key, authorized signatory role, approved numbering-policy reference. Historical examples cannot become approved defaults automatically. |
| `document` / secretariat | Template revision, subject, issue date, recipient fields, authoring unit, signatory role, body, copies, attachments, classification, source citations, DOCX/PDF object keys, issuance status and registry reference. Required unknown facts block issuance. |

For confidential resource kinds, private originals and outputs remain outside `public/`, public projections, model prompt logs, and Vercel build artifacts. Add indexed permission-aware extracted text for archive search; cite source revision and page/section. Apply permission filters before full-text/semantic retrieval and on every file download. Treat retrieved text as untrusted evidence, never executable agent instructions.

## 5. Permissions, RLS and storage

Production Auth is proposed as invite-only; first-owner bootstrap uses a one-time administrator procedure, never a public “become admin” endpoint. Proposed human roles are `owner`, `editor`, `reviewer`, `publisher`, `secretariat`, and `auditor`, scoped to an organizational unit. Reviewer and publisher can be held by the same authorized person for routine links, but no account may approve its own request. Role changes, sensitive issuance, and infrastructure actions require an explicit owner-approved operation; role membership alone is not blanket approval. These future roles are distinct from the implemented local role names in [operations](operations.md).

| Actor | Allowed scope |
| --- | --- |
| Public visitor | Read the safe published projection only, during its activation window. No task, draft, membership, approval, archive, or private file access. |
| Editor | Read in-scope public-content drafts; submit commands and create new revisions. Cannot publish, approve as another person, edit issued records, or elevate roles. |
| Reviewer | Read authorized in-scope preview and record an approval/rejection for the exact revision/operation. No direct public-table write. |
| Publisher | Request publication that consumes a valid approval; cannot bypass or mutate it. |
| Secretariat | Access explicitly granted templates/documents; prepare drafts. Issuance additionally requires named human approval and approved numbering policy. |
| Auditor | Read authorized audit/task metadata; document content needs separate permission. |
| Owner | Invite/revoke, assign roles, approve policies and exceptional operations. Sensitive operations still use logged, explicit requests. |
| Agent/worker | Named allowlisted tools with scoped task identity and expiring capability. No human-role assignment, unrestricted service key, or self-approval. |

Enable RLS and revoke default grants for all exposed tables. Policies use verified `auth.uid()` and active database membership, with both `USING` and `WITH CHECK` on permitted writes. Tenant/unit IDs supplied by callers never authorize themselves. Membership and approval transitions use restricted server/database functions; users cannot update roles, approval status, publication pointers, or audit rows directly. Scope access to confidential resources also requires an explicit clearance/ACL when that phase is added; ordinary public-content membership is insufficient.

Prefer user-context database calls, retaining RLS. Privileged publication/numbering functions must recheck membership and approval, use a fixed search path and narrow grants, and commit all related writes atomically. Any server-only provider admin key bypasses RLS: restrict it to isolated bootstrap/service operations and implement explicit scope checks there. Never expose it in the browser. Avoid granting direct access to a default definer view over private tables; use an audited projection or explicitly secure invoker views.

Storage starts with private `originals`, `drafts`, and `archive` buckets only when uploads are implemented. Object keys include unit/resource/revision IDs; storage policies join authorized metadata rather than trusting a path prefix alone. Short-lived signed downloads require a fresh permission check. Approved public derivatives use separate immutable keys and contain only intentionally public material. Validate magic bytes, size, dimensions and MIME; quarantine pending malware checks, strip unnecessary metadata, sanitize SVG, reject active content, and prevent HTML/script execution in previews.

Link checks are server-side and bounded. Block localhost, private/reserved IP ranges and non-HTTP fetch schemes; resolve and revalidate each redirect/DNS target, limit redirects/time/bytes, and disable uncontrolled automatic redirects. `mailto:`/WhatsApp checks are syntax checks; blocked forms or login pages are marked unverified. HTTP success is not proof of the correct registration form. Preserve `noopener noreferrer` on external new-tab links and HTML-escape all labels/content.

## 6. Agent and task contracts

Agents are task roles behind the same policy-enforcing tools; most M1 steps are deterministic functions. Every tool input includes task ID, actor capability, target scope, expected revision, and validated arguments. Every output includes actual status, produced revision/artifact IDs, evidence, limitations, and audit reference. The model cannot invent a success receipt.

| Agent | Proposed tool allowlist; important boundary |
| --- | --- |
| 00 Orchestrator | `classify_intent`, `read_authorized_context`, `create_task`, `dispatch_allowed_step`, `request_approval`; cannot approve or publish. |
| 01 Content/media | `read_public_content`, `create_revision`, `process_quarantined_asset`, `render_preview`; no overwrite of originals or production pointer. |
| 02 Links | `resolve_action`, `validate_destination`, `propose_action_revision`, `render_action_preview`; publication is a separate human-authorized service. |
| 03 Secretariat | `retrieve_approved_template`, `draft_document`, `render_docx_pdf`, `validate_required_fields`; no number policy changes, fabricated signatures, sending, or issuance. |
| 04 Creative | `read_approved_brand_assets`, `generate_draft_asset`, `render_variants`; public use of an asset follows ordinary content approval. |
| 05 Engineering | Read repository, prepare branch/diff and staging preview, run bounded checks; substantial implementation and production deployment need the supplied approval gates. |
| 06 Research | Read approved/public sources, create cited proposals; no scheduled autonomous work without an explicit schedule/authorization. |
| 07 QA/security | Run validators and authorized browser checks, report actual results; may request rollback, cannot silently grant access or deploy. |

```text
RECEIVED → ANALYZING → EXECUTING → VALIDATING → AWAITING_APPROVAL
  → PUBLISHING → VERIFIED → COMPLETED
```

Read/draft tasks may finish after `VALIDATING` when they have no publication effect. Validation failure returns to `EXECUTING` with a new revision. Rejection returns to drafting or `CANCELLED`; it never advances to publication. Add `WAITING_INPUT`, `FAILED`, `CANCELLED`, `ROLLING_BACK`, and `ROLLED_BACK`; each transition has an authorized actor, reason, evidence and timestamp. Invalid or duplicate transitions return a conflict. A publication committed before verification failure is explicitly reported as published but unverified.

Autonomy is persisted per task: L1 inspect, L2 prepare, L3 execute one approved operation, L4 only an explicit, expiring, revocable automation policy with bounded targets and conditions. Recheck policy at execution time. L4 cannot grant deletion of important records, permission changes, confidential publication, official issuance, numbering-policy changes, payment destination changes, secret changes, infrastructure changes, or substantial unreviewed code deployment.

## 7. Revision-bound approval, retries and rollback

Approval binds `(revision_id, content_hash, operation, environment, expected_published_revision_id, expiry)`. Code deployment additionally binds commit SHA, build/preview artifact digest, tests and deployment target. Revocation, role removal, revision changes, target changes or stale public state invalidate execution. The transaction locks the resource and approval rows, verifies scope and fields, checks that approval is unconsumed, advances the pointer and public projection, marks it consumed and records audit/publication events. Concurrent requests can consume one approval only once.

When jobs are introduced, enqueue in the same database transaction as the task state change. Workers claim due jobs using row locking with `SKIP LOCKED`, bounded leases and a unique lease token. Heartbeats extend only that lease. A stale worker cannot commit results after its lease is reclaimed. Use at-least-once delivery with idempotent domain writes; never promise general exactly-once external execution. Retry transient failures with bounded backoff; stop permanent failures and expose a retryable failed state. A retry uses the same operation key. If an external provider lacks idempotency support and its response is lost, reconcile with the provider before resubmitting to avoid duplicate assets or charges.

Rollback creates a new, explicitly authorized publication restoring a prior known revision; it does not erase history or resurrect revoked approvals. Use a compare-and-swap against the currently published revision so a rollback cannot overwrite a later authorized change. Content rollback and Vercel source-deployment rollback are separate operations. Reverify public reads and relevant pages. Keep schema changes additive and backwards compatible; take and verify backups before destructive migrations. Define recovery targets, provider backup/retention, export ownership, private-object backup and a restore drill before enabling official archives. A backup claim requires a successful restore test.

## 8. Official letter numbering — deferred, never guessed

Add this only after MENWA provides an approved numbering pattern, categories, unit/year rules, signatories and issuance policy.

| Table | Proposed fields and constraints |
| --- | --- |
| `numbering_policies` | `id`, stable `sequence_scope_id`, `unit_id`, category, pattern, timezone/year rule, effective dates, version, `approved_revision_id`; immutable approved versions. Pattern vocabulary is constrained, not executable code. A pattern revision does not reset the sequence implicitly. |
| `number_counters` | `sequence_scope_id`, `unit_id`, category, year, `last_value`; composite PK/unique sequence scope, independent of policy revision. |
| `letter_register` | `id`, `document_revision_id`, `policy_id`, sequence scope, `sequence_no`, `formatted_number`, `state` (`reserved`, `issued`, `void`), `approval_id`, `issued_at?`, issuer, void reason; unique sequence per scope and formatted number per issuing scope, one active issuance per document revision. |

Drafts use a draft ID without an official number. If policy requires a preview reservation, clearly label it unissued. Under one transaction, lock the counter row (initialize through a unique upsert), increment with `UPDATE ... RETURNING`, insert the reservation/register row, bind the approved immutable document revision, and append audit. Do not calculate `MAX+1` or rely on the model. Concurrent requests cannot receive the same number. An issuance operation consumes the explicit approval and finalizes only the bound revision; later edits produce a new draft/correction workflow. Voided or failed reserved numbers stay in the historical register and are never silently reused. Final signing/sending is a separate explicitly authorized action with verifiable evidence, never a generated signature image.

## 9. Prioritized backlog and acceptance gates

| Priority | Deliverable | Acceptance before advancing |
| --- | --- | --- |
| P0 | Repository audit, architecture, exact first-slice proposal | Local implementation approved; production execution remains separate. |
| P1a / approved local slice | Individual local accounts, session/CSRF/RBAC, SQLite persistence, revisions, task/audit timeline, four canonical actions, command/preview/independent approval/public read | Actual editor input changes only the proposed draft; anonymous reads cannot see drafts; authorized approval publishes the exact revision locally; public button and API match; newly approved rollback works. |
| P1b / proposed production foundation | Managed identity, database/RLS, production adapter, migration, staging and operational controls | Isolated staging passes permission/concurrency tests; connected accounts and required approvals exist; backups restore successfully; deploy and public read are independently verified. |
| P1b / production safety tests | Domain and API tests + staging E2E | Anonymous write denied; cross-unit and forged approver denied; removed role denied; stale approval/revision rejected; concurrent publication consumes once; duplicate request idempotent; expired action disabled; unsafe URL/redirect blocked; outage reported honestly. Local subset coverage is listed in operations. |
| P2 | Migrate remaining approved action slots; events, private uploads, responsive derivatives, gallery previews | Original preserved, MIME/quarantine enforced, unauthorized download denied, approved derivative rendered correctly on desktop/mobile. |
| P3 | Versioned template vault, extraction, permission-aware search, DOCX/PDF draft and visual review | Retrieval cites authorized exact sources; superseded template conflict visible; no invented required fields or signatures. |
| P3 | Approved numbering, explicit issuance, private archive | Concurrent numbering test, no duplicate/reused numbers, exact revision approval, issuance and restore exercise pass. |
| P4 | Creative workflow and engineering previews | Brand provenance, real output previews, approved source changes, provider usage/cost controls. |
| P5 | Authorized research schedules, monitoring, hardening | Explicit schedule and revocation; meaningful alerts; restore, session, permission and retention checks pass. |

Preserve existing source/JSX/event/API/build checks for every changed milestone, and add only tests that exercise the new behavior and security boundaries. The current repository's test results are separate audit evidence; this proposal does not assert that future tests, live provider checks or deployments passed.

Before executing P1b, confirm the selected account/project, region, authorized first owner/reviewer/publisher, staging/production separation and deployment rights. Provision and store secrets using the approved provider/deployment settings; never paste them into chat or the repository. Request missing access only when the approved implementation reaches that dependency. Production publication requires its own exact preview/build approval and live verification.

## References for the proposed controls

Provider behavior and pricing must be checked again when provisioning. Current design references: [Supabase RLS and grants](https://supabase.com/docs/guides/database/postgres/row-level-security) documents grant/policy separation, privileged-key bypass, and view hazards; [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) covers private object policies; [PostgreSQL INSERT](https://www.postgresql.org/docs/current/sql-insert.html) documents conflict handling used for unique initialization/idempotency; [Vercel function limitations](https://vercel.com/docs/functions/limitations) describes resource/time constraints to evaluate when choosing the worker boundary. These references do not establish a connected account or a deployed implementation.
