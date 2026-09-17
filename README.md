# Jankurai Repository Quality Gate

Audit repository quality in GitHub Actions. The default audit reads repository
inputs and produces a fresh report. It does not execute repository commands.

**1.8.0 release candidate:** the default auditor pin is `v1.8.0`. That release and
this Action's Marketplace listing are pending qualification. Until then, use a
reviewed Action commit with `release-tag: v1.7.0` for the existing public auditor.
The supervised `plan` option requires the forthcoming qualified Linux producer.

```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
  with:
    persist-credentials: false
- uses: neverhuman/jankurai-action@45375ae8a9c0aca859d4d0b63eacdeb6ff8a6432
  id: quality
  with:
    release-tag: v1.7.0
    fail-under: '85'
- uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
  if: always()
  with:
    name: jankurai-report
    path: ${{ steps.quality.outputs.report-directory }}
```

This example pins the reviewed consumer and ratchet repair. Its [hosted CI](https://github.com/neverhuman/jankurai-action/actions/runs/34412260881)
passed all 126 contract tests and real public-auditor positive, stronger-policy
and regression checks at both floors. A stable `v1.8.0`
example will follow successful 1.8.0 public consumer tests.

| Input | Default | Meaning |
| --- | --- | --- |
| `release-tag` | `v1.8.0` | Signed public auditor release from `neverhuman/jankurai` |
| `path` | `.` | Repository to audit |
| `mode` | `standard` | `standard`, `advisory`, `ratchet`, or `release` |
| `fail-under` | `85` | Additional score floor; use `90` for a stronger requirement |
| `baseline` | `agent/baselines/main.repo-score.json` | Accepted baseline for ratchet/release modes |
| `plan` | empty | Reserved; all nonempty values are rejected |

The effective score requirement retains a stronger repository policy. Setting
`fail-under: '0'` removes only the additional Action floor. Hard findings, failed
scanners, unsuccessful auditor exits and ratchet failures still fail the step.
A passing ratchet flag must also agree with its score, caps, findings and policy;
the supported producer contract permits no score drop or policy change.
An advisory audit cannot hide a failed policy decision.
The report must describe the full repository, and its findings must agree with
the declared counts and passing decision. Missing or contradictory evidence
fails the Action.

Each invocation creates a private directory below `RUNNER_TEMP`. Outputs are
`report-json`, `report-md`, and `report-directory`. Upload the directory with
`if: always()` to retain reports from blocked audits. Failed admission may leave
the directory without a completed report; an older report is never substituted.

Supervised command execution is unavailable in this release. Every nonempty
`plan` value fails clearly before the auditor is launched, on both supported
platforms. Leave `plan` empty to run an ordinary repository audit.

The bundled installer retains the producer's fixed signing, attestation,
provenance, checksum and platform checks. Ordinary installation supports Linux
x86-64 and Apple Silicon macOS. This repository does not publish auditor binaries.
HTTPS downloads allow at most four attempts, with a 15-second connection timeout
and a 60-second limit per attempt. Partial transfers are discarded before retry,
and exhausted retries leave an existing installation unchanged. Verification
failures stop installation without retrying or relaxing the trust checks.

Run `npm test` to exercise the preserved score, policy, freshness and installer
contracts. Controlled verifier/auditor fixtures are labeled in the tests. CI also
runs the composite Action with the real public `v1.7.0` auditor on authored
incomplete repositories at floors 85 and 90. A separate required matrix audits
immutable public Core commit `e831795178a3fb1d5842122625978d92e41d5af5` at both
floors through a remotely pinned Action, then verifies that the candidate Action
blocks a stronger policy and an unsafe workflow. Every audit retains a distinct
fresh report. These are real v1.7.0 consumer checks; successful v1.8.0 consumers
and an external consumer repository remain release gates.

Report vulnerabilities privately through the [producer security advisories](https://github.com/neverhuman/jankurai/security/advisories/new).
