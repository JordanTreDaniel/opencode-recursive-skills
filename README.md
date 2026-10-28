# Recursive skill file listings for OpenCode

OpenCode's skill loader samples only the first 10 files in a skill directory; this plugin rewrites the `skill` tool result so the agent sees every supporting file — recursive, realpaths resolved, capped at 500.

## The problem

When OpenCode loads a skill, core injects a `<skill_files>` block. That block is a **sample, not the directory**: `Skill.prepare()` (`packages/core/src/skill.ts`) ends in `.slice(0, 10)`, and core marks the truncation with `Note: file list is sampled.` Anything past those first 10 entries — `scripts/`, `reference.md`, nested sub-skills — is invisible to the model. It can't call what it can't see.

A second, related case observed while developing the plugin: when the skill entry isn't the canonical `SKILL.md` (i.e. `basename(skill.path) !== "SKILL.md"`), core returns an **empty** `files` list, so `<skill_files>` lists nothing at all.

## What it does

On every completed `skill` tool call, the plugin:

1. Locates the skill directory — `result.metadata.directory` first, then the content's own `Base directory for this skill:` line.
2. Walks it recursively, resolving every path to its realpath (symlinks followed), up to the file cap.
3. Splices a full recursive listing — one `<file>` line per file, sorted — immediately before `</skill_files>` (or `</skill_content>`, or appended).

If the directory can't be resolved, it appends a visible HTML comment saying so and changes nothing else. It never throws and never blocks the tool pipeline.

## The trade-off

The 10-file cap is deliberate. Core spends context economy on it — hence the `Note: file list is sampled.` marker — and for most skills those 10 files are enough. This plugin intentionally trades some of that economy for completeness: on a large skill the spliced block can add many `<file>` lines to the tool result, and each line costs tokens on every later turn that still carries that result.

If that trade isn't worth it, bound it or opt out:

- **Bound it** — set `maxFiles` (or `RECURSIVE_SKILLS_MAX_FILES`) low; the walk stops at the cap and the marker notes `(capped at N)`.
- **Opt out** — remove the plugin from `plugins` to restore core's sampled behavior. There is no per-skill toggle.

## Compatibility

- Requires **OpenCode V2**. Tested against **v2.1.2**.
- It depends on the `execute.after` hook payload shape — specifically `event.tool`, `event.status`, and `event.result.content` being a string or an array of `{type:"text"}` parts containing `<skill_content`. At runtime v2.1.2 delivers the **array** form, which the plugin handles (with a string branch as fallback).
- If a future OpenCode changes that payload shape, or the skill directory can't be resolved, the hook **no-ops** — it finds nothing it recognizes and returns without touching the result. No error, no crash; the skill just loads unsampled.

## Install

The CLI takes the npm module as a positional — there is no `add` subcommand (verified against `opencode plugin --help`):

```bash
opencode plugin opencode-recursive-skills
```

Or add it to `opencode.json(c)` directly:

```jsonc
{
  "plugins": ["opencode-recursive-skills"]
}
```

With options:

```jsonc
{
  "plugins": [
    {
      "package": "opencode-recursive-skills",
      "options": {
        "maxFiles": 300,
        "debug": false
      }
    }
  ]
}
```

> **Local development note:** when loading from a local checkout instead of the npm package, use the `~/...` path form (or a relative path). An absolute-path spec like `"/Users/you/dev/opencode-recursive-skills"` is silently ignored by OpenCode v2.1.2 — no error, the plugin just doesn't load. Verify load with `--print-logs` and look for the `loading plugin id=recursive-skills` line.

## Verify it's working

Load any skill and look for the plugin's marker in the `skill` tool result, immediately before the closing tag:

```
<!-- recursive-skills: recursive list (N files) -->
```

`N` is the number of files the walk found (with `(capped at …)` appended if it hit the cap). If the directory couldn't be resolved, you'll instead see `recursive file list unavailable (skill directory could not be resolved)`.

For a step-by-step trace, set `RECURSIVE_SKILLS_DEBUG=1` (or `"debug": true` in options) and watch stderr for `[recursive-skills]` lines — setup registration, the resolved directory, and the rewrite length.

## Example

Before — core's sampled list:

```xml
<skill_files>
<file>/skills/my-skill/SKILL.md</file>
<file>/skills/my-skill/index.ts</file>
...
Note: file list is sampled.
</skill_files>
```

After — the plugin's splice, immediately before the closing tag:

```xml
<skill_files>
<file>/skills/my-skill/SKILL.md</file>
...
Note: file list is sampled.
</skill_files>
<!-- recursive-skills: recursive list (18 files) -->
<file>/skills/my-skill/SKILL.md</file>
<file>/skills/my-skill/index.ts</file>
<file>/skills/my-skill/scripts/helper.sh</file>
<file>/skills/my-skill/data/table.json</file>
...
```

Observed on a real skill with the plugin loaded on OpenCode v2.1.2: the file list went from **10** entries (core's cap) to **28** (10 baseline + 18 injected), marker `recursive-skills: recursive list (18 files)`.

## How it works

Registers `ctx.tool.hook("execute.after", ...)` via `Plugin.define` from `@opencode/plugin`. Only the `skill` tool is touched (`event.tool !== "skill"` returns early), and only completed results. Core re-reads `result.content` after hooks resolve, so the rewrite reaches the model. The content arrives as an **array** of `{type:"text"}` parts at runtime; the plugin finds the part containing `<skill_content`, rewrites that part's `text`, and returns a new result — a string-content branch is kept as a fallback.

## Options

| Option | Env var | Default | Effect |
|---|---|---|---|
| `maxFiles` | `RECURSIVE_SKILLS_MAX_FILES` | `500` | Safety cap on listed files |
| `debug` | `RECURSIVE_SKILLS_DEBUG=1` | `false` | Opt-in debug logging (silent by default) |

Options beat env vars beat the default.

## Limitations

- **Lists dotfiles** — the walk doesn't filter leading dots, matching core's own `dot: true` scan.
- **No ignore-glob filtering** — unlike core's scan, a `node_modules`-style tree under a skill directory is **not** excluded; it counts against `maxFiles`.
- **500-file cap** — a ceiling, not a sample. Raise or lower it via `maxFiles`.

## Safety notes

- **Bounded** — the recursive walk stops at `maxFiles`, which also guards symlink loops and pathological trees.
- **Fail-silent** — an unresolvable directory, a broken symlink, a vanished file, or any hook error is swallowed; the skill still loads. The unresolvable-directory case leaves a visible HTML comment rather than failing.
- **No network** — the plugin only reads the local filesystem.

## License

MIT
