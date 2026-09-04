# Backup & Restore — Admin Weekly Download

> No AWS/S3. No VPS. Manual weekly export from the admin panel (Vercel + Neon).

## Weekly SOP (for client)

1. Open `/admin?tab=backups` (admin login required).
2. Check **Last backup** line. If older than 7 days, proceed.
3. Click **Download backup now**, confirm the warning.
4. Save `sneh-backup-YYYY-MM-DD.json` in TWO places:
   - Laptop folder, and
   - Google Drive folder `Sneh-Backups/`.
5. Verify: file size > 0, opens as JSON, `meta.counts.users` looks sane.
6. Confirm the **Last backup** line updated to today.

Rules:
- File contains **password hashes + PII + payments**. Never email/WhatsApp/share it.
- Admins can never see passwords on screen — hashes exist only inside the
  downloaded file for restore purposes.
- Password resets go through the existing forgot/reset password flow only.

## What is exported

Single JSON from `GET /api/admin/backup/export` (admin-only, rate-limited 5/day):
`User` (incl. `password` hash), `FamilyDetails`, `Horoscope`, `Preferences`,
`ApprovalLog`, `Photo` (URLs only — images stay in Cloudinary), `Interest`,
`Conversation`, `Message`, `Shortlist`, `Block`, `Account`, `Payment`,
`Subscription`, `VerificationToken` (sessions excluded).

Every success writes a `BackupLog` row; `GET /api/admin/backup/status`
powers the "Last backup" display.

## Restore (operator only, never from admin UI)

1. Create a **fresh Neon branch** for validation.
2. `DIRECT_URL="<branch-direct-url>" node prisma/restore-backup.cjs ./sneh-backup-YYYY-MM-DD.json`
3. Smoke-test: login, profile, payments page.
4. Only then repeat against the target database.

## Safety net

Keep Neon's History Window at the plan maximum for point-in-time recovery
between weekly manual exports.
