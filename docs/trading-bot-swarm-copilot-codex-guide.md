# Trading Bot Swarm: Copilot + Codex Configuration, Codebase Audit, and Operating Guide

## 1) Purpose and Scope

This guide standardizes how **GitHub Copilot** and **Codex** should be used across the Trading Bot Swarm ecosystem while also documenting an architecture/code audit baseline from this repository.

### Goals

- Keep agent-assisted development fast, but predictable.
- Enforce strong quality gates (lint, tests, security scans, release hygiene).
- Reduce unsafe automation in trading-critical code paths.
- Define a repeatable workflow that scales across contributors and services.

### Copilot Role Definition

Copilot is treated as a **pair programmer** rather than an autonomous committer.

Behavioral constraints:

1. Suggest changes, do not self-approve or self-merge.
2. Prefer minimal diffs over broad rewrites.
3. Always respect project lint/type/test/security checks.
4. Never introduce secret material, hardcoded credentials, or unsafe defaults.
5. Require human review for risk-bearing changes (strategy logic, order routing, auth, payments, infra).

---

## 2) Repository Audit Summary (Current Baseline)

This repository is a Vite + React + TypeScript frontend that uses Supabase and local storage for state persistence, with a component-heavy structure and hook-based data flows.

### 2.1 Architecture Snapshot

- **UI stack:** React, Vite, Tailwind, shadcn/ui-style component library.
- **Data/state:** Local React state + custom hooks, localStorage-backed draft persistence.
- **Remote integration:** Supabase client for auth/data access via frontend env vars.
- **Routing:** React Router with route-level pages (`/`, `/auth`, `/profile`, fallback).

### 2.2 Strengths

- Clear separation of pages/components/hooks/libs.
- Supabase types are present and integrated.
- Build pipeline works in current environment.

### 2.3 Gaps and Risks Identified

1. **No automated test suite configured** in scripts (only `dev`, `build`, `lint`, `preview`).
2. **No workflow files present** under `.github/workflows` for CI quality gates.
3. **Type safety is relaxed** (`strictNullChecks: false`, `noImplicitAny: false`, `allowJs: true`).
4. **Lint baseline is not clean** (errors + warnings currently present).
5. **Frontend bundle warning** indicates large chunk output.
6. **Security posture depends on frontend-only controls** for some flows; should be backed by policy/DB constraints and CI scanning.

### 2.4 Priority Remediation Roadmap

- P0: Establish CI lint/test/build gates + dependency scanning.
- P1: Add tests (unit + integration), enforce minimum thresholds.
- P2: Increase TypeScript strictness in phases.
- P3: Optimize bundle splitting for performance-sensitive surfaces.

---

## 3) Configuration Overview for Copilot + Codex

Apply these standards across all Trading Bot Swarm repositories.

### 3.1 Testing Guidelines

- All code changes must run impacted tests locally and in CI.
- Documentation-only changes may skip test execution when no runtime files changed.
- Minimum expectation:
  - unit tests for domain logic,
  - integration tests for API/data boundaries,
  - smoke/e2e coverage for critical trade lifecycle paths.

### 3.2 Linting and Code Style

- Lint and type-check are required quality gates.
- Use a single formatter/linter policy per repo.
- Block merges on lint errors; warnings are either fixed or explicitly suppressed with rationale.

### 3.3 Async and Concurrency Patterns

- No fire-and-forget promises in production flows unless explicitly safe.
- Use timeouts, retries, and circuit-breaker behavior for network operations.
- Idempotency keys for order/execution paths.

### 3.4 Security Defaults

- Principle of least privilege for API keys, bot service accounts, and CI tokens.
- Secrets only in secret managers (never in repo or prompt context).
- Enforce branch protections and signed commits for protected branches.

### 3.5 Logging and Observability

- Structured logs with correlation IDs.
- Metrics for latency, failure rates, and queue depth.
- Alerting for execution failures, risk threshold breaches, and auth anomalies.

### 3.6 CI/CD Integration

- CI runs lint, tests, type-check, and security scans on PRs.
- Protected release job handles semantic versioning and changelog generation.
- Deployment gates require green quality checks.

### 3.7 Version Control Workflow

- Trunk-based with short-lived branches.
- Conventional commits for release automation.
- PR templates require risk notes and validation evidence.

---

## 4) Custom Instruction Behavior for Codex and Copilot

Below is a conceptual YAML model for shared instruction behavior.

```yaml
ai_assistant_policy:
  applies_to:
    - github_copilot
    - codex

  behavior:
    role: "pair_programmer_with_guardrails"
    constraints:
      - "Do not bypass CI gates"
      - "Do not introduce secrets, credentials, or private keys"
      - "Do not weaken auth, risk checks, or input validation"
      - "Prefer smallest safe diff"

  change_validation:
    docs_only_rule:
      description: "Skip tests/lint only when only docs/markdown changed"
      allow_skip: true
    code_change_rule:
      description: "Run lint + tests + type-check before proposing merge"
      required_commands:
        - "npm run lint"
        - "npm test"
        - "npm run typecheck"

  coding_rules:
    style:
      - "Follow repo lint/format config"
      - "Prefer explicit types over any"
    async:
      - "No unhandled promises"
      - "Use bounded retries and timeout for external calls"
    security:
      - "Validate all untrusted inputs"
      - "Never log secrets or personal data"

  pr_requirements:
    - "Include summary of changes"
    - "Include risk assessment"
    - "Include evidence of validation commands"
```

### Example rule snippets

- "If any `.ts`, `.tsx`, `.js`, or backend runtime file changes, run lint + tests before PR."
- "If only `.md` files changed, tests may be skipped with note: `docs-only change`."
- "Reject suggestions that disable authentication, authorization, or risk controls."

---

## 5) GitHub Workflow Example: Lint + Test Automation

```yaml
name: quality-gate

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck --if-present

      - name: Unit tests
        run: npm test -- --ci --coverage --passWithNoTests

      - name: Build verification
        run: npm run build
```

**Trigger conditions:** PRs and direct pushes to `main`.

**Quality gate steps:** checkout, install, lint, type-check, tests, build.

---

## 6) Best-Practice Workflow: Semantic Release + Version Tagging

```yaml
name: release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm test -- --ci --passWithNoTests
      - run: npm run build

      - name: Semantic release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

Versioning guidance:

- `feat:` → minor bump
- `fix:` → patch bump
- `BREAKING CHANGE:` → major bump

---

## 7) Best-Practice Workflow: Security + Dependency Scanning

```yaml
name: security-scan

on:
  pull_request:
  schedule:
    - cron: "0 3 * * *"

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: npm audit
        run: npm audit --audit-level=high

      - name: CodeQL init
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - name: CodeQL analyze
        uses: github/codeql-action/analyze@v3
```

Recommended add-ons:

- Dependabot updates (weekly).
- Secret scanning + push protection.
- SAST on every PR, DAST on scheduled cadence for deployed environments.

---

## 8) Contributor Guidelines

### 8.1 Proposing Changes

- Open PR with scoped objective and risk class (low/medium/high).
- Include screenshots when changing visual components.
- Attach validation output for lint/tests/build.

### 8.2 Review Criteria

- Correctness and rollback safety.
- Security and risk-control integrity.
- Test coverage impact and observability updates.
- Performance implications (latency, memory, bundle size).

### 8.3 Validation Process

- Local checks: lint, tests, build.
- CI checks: quality gate + security scan.
- Manual verification for strategy behavior and boundary conditions.

---

## 9) Troubleshooting and Optimization Tips

- **Lint failures:** fix root issue first; avoid broad disables.
- **Flaky tests:** isolate time/network dependencies, add deterministic mocks.
- **Large bundles:** add route-level splitting and dependency audits.
- **Slow CI:** parallelize jobs and use dependency caching.
- **Auth/environment issues:** validate required env vars and branch protection secrets.

---

## 10) Maintenance Schedule for This Guide

- **Weekly:** triage lint/test/security drift and update examples if tooling changes.
- **Monthly:** review instruction policies against incident reports and release outcomes.
- **Quarterly:** full architecture + guardrail review with platform/security stakeholders.
- **On major changes:** immediate update when CI, release model, auth, or risk controls change.

---

## Final Note

The objective is to **standardize excellence**: consistent engineering behavior, verifiable quality, and secure automation that strengthens the reliability, performance, and safety of the trading ecosystem.
