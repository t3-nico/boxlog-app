# Agents

Custom agents in `.claude/agents/` are spawned via the Task tool for **reviewing existing code**, not writing new code. For implementation patterns, use Skills instead.

## When to Use

| Tool                       | Purpose                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| **Skills** (`/skill-name`) | Implementation patterns for NEW code                                              |
| **Agents** (Task tool)     | Review/audit of EXISTING code; adversarial analysis; cross-cutting quality checks |

## Catalog

### Specialist Agents

| Agent                 | Model | MUST use when                                                           |
| --------------------- | ----- | ----------------------------------------------------------------------- |
| `react-specialist`    | opus  | New Server/Client boundary decisions; component hierarchy restructuring |
| `typescript-pro`      | opus  | Shared types across Zod/tRPC/frontend; discriminated union design       |
| `ux-critic`           | opus  | New user-facing interaction flows; mobile layout changes                |
| `performance-analyst` | opus  | p95 threshold exceeded; bundle size increase >5KB; new data fetching    |
| `database-architect`  | opus  | Schema migrations; new RLS policies; new tables                         |

### Security Agents (run as a team)

| Agent              | Model  | MUST use when                                             |
| ------------------ | ------ | --------------------------------------------------------- |
| `security-auditor` | sonnet | Pre-PR scan (auth/API/Zod changes); weekly scheduled scan |
| `red-team`         | opus   | Pre-deploy auth/API changes; monthly review               |
| `blue-team`        | opus   | Responding to red-team findings; defense-in-depth review  |

## Security Review Flow

1. `security-auditor` (sonnet) - fast PASS/FAIL regression scan
2. `red-team` (opus) - adversarial vulnerability discovery
3. `blue-team` (opus) - defense validation + counter-proposals

## Cost Awareness

See `ai-behavior.md` for model cost table. Prefer `security-auditor` (sonnet) over red/blue-team (opus) for routine scans. Parallel Haiku searches > single Opus scan for file discovery.
