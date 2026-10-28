// opencode-recursive-skills — full recursive file listings for OpenCode skills.
//
// OpenCode core injects a `<skill_files>` block into the skill tool's output
// listing at most 10 files (packages/core/src/skill.ts — `.slice(0, 10)`).
// Skills with more files silently hide the rest. This plugin hooks the skill
// tool's `execute.after` event and splices a full recursive file listing into
// the content before `</skill_files>`, so the assistant sees every file.
//
// Behavior contract:
//   - never throws, never blocks the tool pipeline
//   - silent no-op for every tool except `skill`, and for non-completed results
//   - if the skill directory can't be resolved, a visible HTML comment note is
//     appended instead of failing
//   - silent by default; opt-in debug logging via option `debug: true` or
//     `RECURSIVE_SKILLS_DEBUG=1`

import { Plugin } from "@opencode/plugin"
import fs from "node:fs"
import path from "node:path"

/** Safety cap — skills are small; this bounds pathological cases. */
const DEFAULT_MAX_FILES = 500

interface RecursiveSkillsOptions {
  /** Max files to list (default 500). */
  maxFiles?: number
  /** Opt-in debug logging (default false). */
  debug?: boolean
}

/** Recursive walk returning absolute realpaths (fs.realpathSync per file). */
function walk(dir: string, maxFiles: number, out: string[] = []): string[] {
  if (out.length >= maxFiles) return out
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (out.length >= maxFiles) break
    const full = path.join(dir, entry.name)
    let real: string
    try {
      real = fs.realpathSync(full) // resolves symlinks to their real target
    } catch {
      continue // broken symlink / vanished
    }
    let stat: fs.Stats
    try {
      stat = fs.statSync(real) // follows links so symlinked files/dirs are traversed
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      walk(real, maxFiles, out)
    } else if (stat.isFile()) {
      out.push(real) // stored path is always the realpath
    }
  }
  return out
}

/** Insert `block` before </skill_files>, else before </skill_content>, else append. */
function splice(content: string, block: string): string {
  const closeFiles = content.lastIndexOf("</skill_files>")
  if (closeFiles !== -1) {
    return content.slice(0, closeFiles) + block + "\n" + content.slice(closeFiles)
  }
  const closeContent = content.lastIndexOf("</skill_content>")
  if (closeContent !== -1) {
    return content.slice(0, closeContent) + block + "\n" + content.slice(closeContent)
  }
  return content + "\n" + block
}

/** Locate the skill directory: metadata first, then the content's own "Base directory" line. */
function skillDirectory(event: { result?: { metadata?: Record<string, unknown> } }, text: string): string | undefined {
  const fromMeta = event.result?.metadata?.directory
  if (typeof fromMeta === "string" && fromMeta.length > 0) return fromMeta
  const match = text.match(/^Base directory for this skill: (.+)$/m)
  if (match) return match[1].trim()
  return undefined
}

/** Build the recursive-list block and splice it into the content. */
function rewrite(content: string, directory: string | undefined, maxFiles: number): string {
  if (!directory) {
    // Can't resolve the skill dir — append a visible note instead of failing.
    return splice(content, "<!-- recursive-skills: recursive file list unavailable (skill directory could not be resolved) -->")
  }
  const files = walk(directory, maxFiles).sort()
  const lines = files.map((file) => `<file>${file}</file>`)
  const capped = files.length >= maxFiles ? ` (capped at ${maxFiles})` : ""
  const block = [`<!-- recursive-skills: recursive list (${files.length} files${capped}) -->`, ...lines].join("\n")
  return splice(content, block)
}

function envFlag(name: string): boolean {
  return process.env[name] === "1" || process.env[name] === "true"
}

function envInt(name: string): number | undefined {
  const raw = process.env[name]
  if (!raw) return undefined
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export default Plugin.define({
  id: "recursive-skills",
  async setup(ctx) {
    const options = ctx.options as RecursiveSkillsOptions
    const maxFiles =
      (typeof options.maxFiles === "number" && options.maxFiles > 0 ? options.maxFiles : undefined) ??
      envInt("RECURSIVE_SKILLS_MAX_FILES") ??
      DEFAULT_MAX_FILES
    const debug = options.debug === true || envFlag("RECURSIVE_SKILLS_DEBUG")
    const log = (...args: unknown[]) => {
      if (debug) console.log("[recursive-skills]", ...args)
    }

    log(`setup: registering execute.after hook (maxFiles=${maxFiles})`)

    await ctx.tool.hook("execute.after", (event) => {
      try {
        if (event.tool !== "skill") return // no-op for every other tool
        if (event.status !== "completed") return
        const raw = event.result.content

        // content is string | Array<{type:"text",text}|{type:"file",...}> — observed at runtime as an ARRAY.
        if (typeof raw === "string" && raw.includes("<skill_content")) {
          const directory = skillDirectory(event, raw)
          const mutated = rewrite(raw, directory, maxFiles)
          if (mutated === raw) return
          event.result = { ...event.result, content: mutated }
          log(`rewrote content dir=${directory ?? "UNRESOLVED"} newLen=${mutated.length}`)
          return
        }
        if (Array.isArray(raw)) {
          const index = raw.findIndex((part) => part.type === "text" && part.text.includes("<skill_content"))
          if (index === -1) return
          const part = raw[index]
          if (part.type !== "text") return
          const directory = skillDirectory(event, part.text)
          const mutated = rewrite(part.text, directory, maxFiles)
          if (mutated === part.text) return
          const next = raw.slice()
          next[index] = { ...part, text: mutated }
          event.result = { ...event.result, content: next }
          log(`rewrote content dir=${directory ?? "UNRESOLVED"} newLen=${mutated.length}`)
        }
      } catch (error) {
        // Never block or fail the tool pipeline.
        log("hook error (ignored):", error)
      }
    })
  },
})
