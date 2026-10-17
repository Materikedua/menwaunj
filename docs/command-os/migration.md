# Command OS — proposed production migration

Status: **not executed**. Stage 1 is a local Node 24/SQLite workflow. No managed database, Auth project, private bucket, background worker or production content adapter is claimed to be connected. The production handlers intentionally return `503` until a real adapter is implemented. Setting an environment variable alone must not enable an unimplemented backend.

## 1. Decide the production boundary

Retain the existing React/Vite frontend and Vercel deployment. Proposed minimum: managed PostgreSQL, invite-only Auth, and private object storage from one provider, such as Supabase. This avoids operating separate identity, database and file services. Existing managed PostgreSQL/Auth/S3-compatible services are also valid if MENWA already has authorized accounts. Confirm region, data policy, account ownership, costs, backup retention, and staging/production separation before provisioning.

The local SQLite file is not shared Vercel persistence. Do not upload `.command-os/command.sqlite`, local accounts, passwords, sessions or backup copies into `public/`, a deployed function bundle, Git, or a frontend environment variable. The local Vite middleware remains a local development integration; production requires a reviewed server adapter.

## 2. Freeze and inventory the source

1. Record the reviewed Git commit, the four action IDs, current URLs, published revisions and pending tasks. Compare the rendered local buttons with the public projection. Keep the original repository fallback URLs separately as a rollback baseline.
2. Stop the local development server and account CLI before backing up SQLite. Copy the complete `.command-os` data directory, including any SQLite sidecar files, into an access-restricted backup location. If downtime is impossible, use a supported SQLite online backup operation; do not copy a live database file alone.
3. Restore that backup into a separate local directory, open it with the same application version, verify table counts/revisions and perform read-only checks. Do not claim recovery readiness merely because a copy exists.
4. Export only approved business history through a reviewed migration tool: action IDs, revisions, published pointer, tasks, approvals, actor references and audit events. Preserve timestamps and IDs; calculate export checksums in a migration manifest. The local slice has no separate stored content hash or revision table, so reconstruct version mappings from actions/tasks without inventing source evidence. Confidential documents do not exist in this slice and should not be invented as migration input.

No migration utility or managed connection is implied by this plan. Build and test that utility as part of the separately approved production milestone.

## 3. Implement the production adapter in staging

Use the domain/API behavior in [architecture](architecture.md), with the implemented local contracts in [operations](operations.md) as the compatibility baseline.

| Local concept | Proposed production destination | Required rule |
| --- | --- | --- |
| Individual local user | Managed Auth user + scoped membership | Invite real people; map historical actor IDs through an immutable mapping table. Never migrate session tokens or assume matching usernames establish identity. |
| Local password hash | No imported browser credential | Require new provider sign-in/enrollment. Keep historical actor attribution separately. |
| Current action + immutable revision | Scoped resource + revisions + safe published projection | Preserve the four stable IDs and exact URLs; use a validated explicit schema and revision mapping. |
| Pending approval | New pending review under production identity | Reapprove in the new environment; a local approval does not authorize production publication. |
| Historical approval/publication | Immutable migration history | Preserve origin and environment; do not replay it as a new approval or live mutation. |
| Task/audit history | Task/events/audit records with provenance | Preserve order and outcomes; imported events are labeled as local history. |
| Local administrator CLI | Approved managed bootstrap/admin procedure | No public bootstrap endpoint, shared default account or self-assigned role. |

Create migrations with grants, RLS, constraints and narrow transactional functions together. Default-deny draft/task/membership access. Anonymous access is limited to the public-safe projection. Browser clients cannot set approval actor IDs, roles, publication pointers or audit content. If a privileged provider key is needed, isolate it server-side and recheck authorization because privileged credentials bypass RLS.

For each publication, lock the approval and target action, check active membership, independent approver, exact revision/hash, expected current version, environment and expiry, then write the projection/history/audit and consume the approval in one transaction. Enforce uniqueness for idempotency keys and reject the same key with a different payload. Keep rollback as a newly approved task.

## 4. Verify before cutover

Production readiness requires evidence from staging, not a green frontend build alone:

- Anonymous requests cannot access drafts, tasks, account information, audit data or approval mutations.
- Editor/approver separation holds; a requester cannot approve their own task even if they hold multiple roles. Revoked/deactivated accounts lose mutation access immediately.
- Forged identity/role/CSRF/origin requests fail; session lifetime, logout, cookie security and login throttling are tested against the actual production transport.
- Two concurrent publish attempts consume one approval once. Stale approvals, revisions, hashes and expected public versions fail without partial changes.
- Public reads and each relevant rendered CTA return the published value only, with a positive integer revision. API outage falls back to the reviewed repository baseline and reports the limitation to the operator.
- Migration counts, hashes, revision order and published pointers reconcile. No pending local approval can authorize a production mutation.
- An approved rollback restores the intended prior URL, preserves audit history, and does not overwrite a later authorized change.
- External URL syntax validation does not masquerade as form ownership or availability verification. Preserve the exact existing short-link baseline; never expand and replace it silently.
- Backups restore successfully into isolated storage; retention and restore ownership are assigned. Application and database rollback are rehearsed separately.

If private uploads are added later, test bucket policies, expired signed URLs, cross-unit file access, quarantine, sanitized preview rendering, metadata exposure and object backup/restore before putting institutional documents into the system. If official numbering is added, approve its policy and run concurrent issuance/void tests before issuing a number.

## 5. Cut over only after explicit production approval

1. Show the exact reviewed commit/build, staging preview, migration reconciliation and permission/concurrency test results.
2. Obtain deployment/publication approval for that environment and artifact. Keep local implementation approval separate.
3. Import into production once with a migration ID and immutable manifest; rerunning that ID must reconcile or be idempotent, never duplicate records.
4. Configure secrets in the authorized provider/Vercel environment settings, with environment isolation. Keep secrets out of chat, logs, source files and `VITE_*` variables.
5. Enable the implemented production adapter deliberately, deploy, and verify actual anonymous API output and rendered buttons against the recorded publication/revision IDs.
6. Report success only with observed results. If verification fails, disclose whether publication committed and use the reviewed rollback procedure.

Rollback source deployment to the previous reviewed commit while retaining the approved baseline links. Roll back content through a new approved publication. Prefer additive database migrations so an application rollback can still read the schema; restoring a database snapshot is a separate exceptional action that may discard later work and needs a reconciliation plan. Keep history and export evidence until recovery is verified.

## 6. Next capabilities remain separate milestones

Events/media, private document archives, retrieval, letter numbering/issuance, creative generation, jobs, scheduled research and production deployment automation are proposed after the link slice. They are not activated by this migration plan. The staged model, roles, tool permissions and acceptance gates are specified in [architecture](architecture.md).

Primary references: [Supabase RLS/grants](https://supabase.com/docs/guides/database/postgres/row-level-security), [private Storage policies](https://supabase.com/docs/guides/storage/security/access-control), and [Vercel function limitations](https://vercel.com/docs/functions/limitations). Recheck account-specific capabilities and terms during provisioning.
