# Daily continuation

Work only in this repository. The confirmed public owner is DHD-04. Read README.md, ROADMAP.md, PROGRESS.md, recent git history and the original brief in the scheduling chat before editing.

Fetch origin/main and verify the last recorded push. Reconcile local-only commits or interrupted pushes before starting a new milestone. Preserve unrelated changes. Complete at most one development milestone per Europe/Paris calendar day. If a run was missed, continue from the first unfinished milestone and record the actual date.

Implement the milestone through its normal UI and API entry points. Preserve strict per-user access controls. Run relevant tests, build, check for secrets and review the staged diff. Use the exact milestone commit subject from ROADMAP.md. Push normally to main, compare the remote hash to the local hash, then record the verified milestone hash and results in PROGRESS.md in a documentation follow-up commit. Verify the follow-up push too. Never fabricate dates or empty commits.

Use a dedicated local database. Keep credentials in ignored environment files. Never force-push, delete repositories, modify existing external repositories, or enable paid hosting without explicit authorization. Report partial results and actionable blockers accurately.

After the final release, stop the continuation schedule. Do not add extra daily commits after the challenge is complete.
