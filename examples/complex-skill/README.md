# Example: a skill tree that outgrows the 10-file cap

This example shows why a real skill is a **tree, not a flat list of 10 files**:
load `project-tracker/` in OpenCode with and without this plugin and compare the
`<skill_files>` block, and you will see the built-in loader silently hide whole
sub-skill branches while the plugin lists every path.

## The real mechanism (corrected)

An earlier version of this example claimed core sorts *all* files and slices
the first 10 — as if `SKILL.md` files counted. They don't. Verified against the
bundled `Skill.prepare` in the OpenCode v2.1.2 release binary, the file sample
is built as:

```
scan("**/*")                                // every file under the skill dir
  .filter((file) => basename(file) !== "SKILL.md")   // ← SKILL.md removed FIRST
  .toSorted()                               // UTF-16 code-unit order
  .slice(0, 10)                             // then the cap
```

So the 10-file cap counts only a skill's **supporting files** (reference,
templates, scripts, examples, queries). Every `SKILL.md` — including the one
being loaded — is filtered out before sorting and never appears in the sample
at all. A skill with 4 `SKILL.md` files and 9 supporting files never hits the
cap; a skill with more than 10 supporting files does.

## What to notice

`project-tracker/` has three unrelated sub-skills — `task-creation`,
`calendar-scheduling`, and `reporting`. It has **18 supporting files**, so the
cap engages: core shows the first **10** and hides **8**. The sort is
alphabetical, and `task-creation` and `reporting` both come after
`calendar-scheduling`, so **the cut lands exactly at a sub-skill boundary and
the entire supporting file set of two branches disappears**:

- `sub-skills/task-creation/` — all 5 of its supporting files hidden
- `sub-skills/reporting/` — all 3 of its supporting files hidden

The agent sees the root's shared files and all of `calendar-scheduling`, then
the list simply stops. A map that omits whole branches is worse than no map,
because the agent cannot navigate to what it cannot see.

## Command shape (do not run — this is the shape)

Load the skill both ways and diff the `<skill_files>` block:

```
# without the plugin (core's 10-file sample)
<skill name="project-tracker" />          # then read the <skill_files> block

# with opencode-recursive-skills enabled
<skill name="project-tracker" />          # <skill_files> now lists all 22 paths
```

Compare: the plugin's block contains every path in the tree — all 22 files,
including the four `SKILL.md` files that core filtered out; core's block stops
at 10 supporting files and never mentions `task-creation/` or `reporting/`.

## The honest first-10 computation

**How this was produced (stated so it can be checked):** the sorted list below
is **computed, not captured** — it was produced by replaying the exact pipeline
quoted above against the real files in `project-tracker/` (recursive file
walk, filter out every `SKILL.md`, default `toSorted()`, `slice(0, 10)`).
Paths are shown skill-relative; core prefixes them with the absolute skill
directory, which does not change the order. A live capture was not taken
because invoking the skill tool requires a model run against a registered
skill; the computation mirrors the v2.1.2 binary's bundled source line for
line. All 18 supporting files, in the exact order core sorts them:

```
 1. reference/api-limits.md                                            (shown)
 2. reference/field-mapping.md                                         (shown)
 3. reference/property-glossary.md                                     (shown)
 4. scripts/new-ticket.sh                                              (shown)
 5. scripts/shared-auth.sh                                             (shown)
 6. scripts/status-report.sh                                           (shown)
 7. sub-skills/calendar-scheduling/reference/business-hours.md         (shown)
 8. sub-skills/calendar-scheduling/reference/timezones.md              (shown)
 9. sub-skills/calendar-scheduling/scripts/find-slots.sh               (shown)
10. sub-skills/calendar-scheduling/templates/invite.md                 (shown)
--- core's slice(0, 10) ends here ---
11. sub-skills/reporting/queries/weekly-rollup.md                      (hidden)
12. sub-skills/reporting/reference/metric-definitions.md               (hidden)
13. sub-skills/reporting/templates/exec-summary.md                     (hidden)
14. sub-skills/task-creation/examples/completed-task.md                (hidden)
15. sub-skills/task-creation/examples/duplicate-check.md               (hidden)
16. sub-skills/task-creation/reference/priority-rubric.md              (hidden)
17. sub-skills/task-creation/templates/label.md                        (hidden)
18. sub-skills/task-creation/templates/task.md                         (hidden)
```

**Core shows files 1–10. The cap hides files 11–18** — the complete supporting
file set of the `task-creation/` branch *and* of the `reporting/` branch. The
`SKILL.md` files (root plus one per sub-skill, 4 total) are not in this list at
all: they were filtered before the sort, so they neither consume slots nor
rescue their branches.

Note on depth: the hidden set includes the deepest files in the tree
(`task-creation/templates/task.md`, `reporting/queries/weekly-rollup.md`), but
depth is not what decides the cut — alphabetical order is. A deeper file placed
early alphabetically (e.g. `calendar-scheduling/templates/invite.md`, position
10) is shown, while shallower files placed late (`reporting/reference/…`,
position 12) are hidden.

## File count

22 files total under `project-tracker/` — 4 `SKILL.md` + 18 supporting files
(23 with this README). 18 > 10, so the cap bites: 10 shown, 8 hidden.
