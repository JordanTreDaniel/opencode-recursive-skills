# Recursive skill file listings for OpenCode

When OpenCode loads a skill, core injects a `<skill_files>` block listing at most **10 files** — skills with more files silently hide the rest. This plugin fixes that: it hooks the skill tool's `execute.after` event and splices a **full recursive file listing** (realpaths, symlinks followed, capped for safety) into the content before `</skill_files>`.

## The problem

OpenCode's skill loader caps the injected file list at 10 entries (`packages/core/src/skill.ts`, `.slice(0, 10)`). A skill with scripts, sub-skill references, or data files beyond those first 10 gives the model no indication the rest exist — it can't call what it can't see.

## What it does

On every completed `skill` tool call, the plugin:

1. Locates the skill directory (`result.metadata.directory`, falling back to the `Base directory for this skill:` line in the content).
2. Walks it recursively, resolving every path to its realpath (symlinks followed), up to a 500-file cap.
3. Splices the full listing — one `<file>` line per file — right before `</skill_files>` (or `</skill_content>`, or appended).

If the skill directory can't be resolved, it appends a visible HTML comment noting that, and otherwise changes nothing. It never throws and never blocks the tool pipeline.

## Install

Via the CLI (verified against `opencode plugin --help` — the module name is a positional, there is no `add` subcommand):

```bash
opencode plugin opencode-recursive-skills
```

Or add it to `opencode.json(c)`:

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

> **Local development note:** when loading from a local checkout instead of the npm package, use the `~/...` path form (or a relative path). An absolute-path spec like `"/Users/you/dev/opencode-recursive-skills"` is silently ignored by OpenCode v2.1.2 — no error, the plugin just doesn't load. Verify load with `--print-logs` and look for the `loading plugin id=...` line.

## Example

Before — core's capped list:

```xml
<skill_files>
<file>/skills/my-skill/SKILL.md</file>
<file>/skills/my-skill/index.ts</file>
...
<!-- 8 more files shown; 20+ hidden -->
</skill_files>
```

After — the plugin's splice, immediately before the closing tag:

```xml
<skill_files>
<file>/skills/my-skill/SKILL.md</file>
...
</skill_files>
<!-- recursive-skills: recursive list (27 files) -->
<file>/skills/my-skill/SKILL.md</file>
<file>/skills/my-skill/index.ts</file>
<file>/skills/my-skill/scripts/helper.sh</file>
<file>/skills/my-skill/data/table.json</file>
...
```

## How it works

Registers `ctx.tool.hook("execute.after", ...)` via `Plugin.define` from `@opencode/plugin`. After the skill tool completes, core re-reads `result.content` — so the hook can rewrite it before the assistant sees it. Only the `skill` tool is touched; every other tool call passes straight through.

## Options

| Option | Env var | Default | Effect |
|---|---|---|---|
| `maxFiles` | `RECURSIVE_SKILLS_MAX_FILES` | `500` | Safety cap on listed files |
| `debug` | `RECURSIVE_SKILLS_DEBUG=1` | `false` | Opt-in debug logging (silent by default) |

## Safety notes

- **500-file cap** — bounds pathological or symlink-loop directories; hard-stoppable via `maxFiles`.
- **Silent failure** — unresolvable skill directory or any hook error is a no-op (with a visible comment for the unresolvable case), never a thrown error.
- **No network** — the plugin only reads the local filesystem; it makes no network requests.

## License

MIT
