#!/usr/bin/env bash
# Local CI runner: the family's required entrypoint, so a green local run means a
# green CI run. This repository has no GitHub Actions workflows; CI on our own
# hosts calls the same lanes.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Offline, scriptless install from the committed lockfile.
install_deps() {
  npm ci --ignore-scripts --no-audit --no-fund
}

# Contract, gate and installer tests.
unit() {
  npm test
}

# The lockfile is the only trust root for installs; keep it present and pinned to
# the public registry over HTTPS.
lockfile_trust() {
  test -f package-lock.json || { echo "package-lock.json is missing" >&2; return 1; }
  if grep -nE '"resolved": "(http:|git|file:)' package-lock.json; then
    echo "package-lock.json resolves a dependency outside the HTTPS registry" >&2
    return 1
  fi
  echo "lockfile trust checks passed"
}

lane="${1:-required}"
case "$lane" in
  required) install_deps; unit ;;
  fast)     unit ;;
  security) lockfile_trust ;;
  audit)    install_deps; npm audit --audit-level=high ;;
  gates)    install_deps; unit; lockfile_trust; npm audit --audit-level=high ;;
  *) echo "usage: $0 {required|fast|security|audit|gates}" >&2; exit 2 ;;
esac
