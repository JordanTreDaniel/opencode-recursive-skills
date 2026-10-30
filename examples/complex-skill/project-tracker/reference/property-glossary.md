# Property glossary

Field names used across tracker objects.

- `title` — short human label.
- `status` — one of `todo`, `in_progress`, `blocked`, `done`.
- `assignee` — the person responsible.
- `due_date` — ISO date; may be empty.
- `tags` — free-form list of strings.
- `created_at` — set by the server; never sent by the client.

Values for `status` are closed — reject anything outside the list above.
