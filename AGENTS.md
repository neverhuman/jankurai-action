# Jankurai Action

This is the canonical primary checkout for `neverhuman/jankurai-action`.
The parent workspace's zero-new-worktree and ownership rules apply.

Preserve the Action input/output contract and the installer's fixed production
trust identities. Ordinary audits do not execute repository commands. Supervised
execution must fail closed without the qualified Linux auditor environment.

Run `bash scripts/ci-local.sh required` before handoff; it installs from the
lockfile and runs `npm test`. The other lanes are `fast` (tests only), `security`
(lockfile trust), `audit` and `gates` (all of them); an unknown lane exits 2.
`agent/test-map.json` maps each zone to the lane that proves it.
This repository has no GitHub Actions workflows; GitHub is a publishing mirror
and CI runs on our own hosts.
Do not publish a stable Action release before its public auditor release and real
consumer qualification pass.
