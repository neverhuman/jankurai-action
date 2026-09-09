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
- uses: neverhuman/jankurai-action@02d03bf8ef56fccce66c7b563573c68f52c9361e
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

This example pins the reviewed initial implementation. Its [hosted CI](https://github.com/neverhuman/jankurai-action/actions/runs/34403006257)
passed the contract suite and real public-auditor failure tests. A stable `v1.8.0`
example will follow successful 1.8.0 public consumer tests.

| Input | Default | Meaning |
| --- | --- | --- |
| `release-tag` | `v1.8.0` | Signed public auditor release from `neverhuman/jankurai` |
| `path` | `.` | Repository to audit |
| `mode` | `standard` | `standard`, `advisory`, `ratchet`, or `release` |
| `fail-under` | `85` | Additional score floor; use `90` for a stronger requirement |
| `baseline` | `agent/baselines/main.repo-score.json` | Accepted baseline for ratchet/release modes and supervised runs |
| `plan` | empty | Optional reviewed proof-plan path; selects supervised `ci run` |

The effective score requirement retains a stronger repository policy. Setting
`fail-under: '0'` removes only the additional Action floor. Hard findings, failed
scanners, unsuccessful auditor exits and ratchet failures still fail the step.
An advisory audit cannot hide a failed policy decision.

Each invocation creates a private directory below `RUNNER_TEMP`. Outputs are
`report-json`, `report-md`, and `report-directory`. Upload the directory with
`if: always()` to retain reports from blocked audits. Failed admission may leave
the directory without a completed report; an older report is never substituted.

Supplying `plan` selects `jankurai ci run` with literal argument arrays and the
configured baseline/mode. This path is Linux-only. The qualified auditor must
admit pinned bubblewrap confinement and delegated cgroup v2 resource controls;
missing controls fail admission. There is no host-execution fallback. A passing
shell fixture is not evidence that confinement or genuine tool execution passed.

The bundled installer retains the producer's fixed signing, attestation,
provenance, checksum and platform checks. Ordinary installation supports Linux
x86-64 and Apple Silicon macOS. This repository does not publish auditor binaries.

Run `npm test` to exercise the preserved score, policy, freshness and installer
contracts. Controlled verifier/auditor fixtures are labeled in the tests. CI also
runs the composite Action with the real public `v1.7.0` auditor on authored
incomplete repositories at floors 85 and 90. This verifies installation and real
failure propagation; successful 1.8.0 consumers remain a release gate.

Report vulnerabilities privately through the [producer security advisories](https://github.com/neverhuman/jankurai/security/advisories/new).
