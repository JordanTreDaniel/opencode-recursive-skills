---
name: project-tracker-calendar-scheduling
description: Find an open meeting slot across calendars. Use when the user wants to schedule, find a time, or book a meeting. Reads availability and suggests slots; does not create tasks.
---

# Calendar scheduling

Find a free time window across one or more calendars. This is unrelated to
task creation and reporting — it reads availability only and suggests slots.

## Steps

1. Source the shared token: `bash scripts/shared-auth.sh`.
2. Collect the calendars and the desired duration.
3. Run `scripts/find-slots.sh` to intersect availability within the bounds of
   `reference/business-hours.md`.
4. Suggest the top few slots; once the user picks, draft the invite from
   `templates/invite.md`.

## Gotchas

- Respect the read rate limit (100/min) when fanning out across calendars.
- Convert to the invitee's timezone using `reference/timezones.md`.
- Suggest, do not book, until the user confirms.
