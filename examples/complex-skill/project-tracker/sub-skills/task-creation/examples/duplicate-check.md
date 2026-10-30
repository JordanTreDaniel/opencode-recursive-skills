# Example: duplicate check before create

Search for an existing match on `title` before creating a task. Two records
that would be considered the same task:

title: "File expense report"
title: "File expense report" # same title, same assignee -> duplicate

title: "File expense report"
title: "File Q4 expense report" # different scope -> not a duplicate

If a close match exists, surface it to the user instead of creating a second
task. Do not merge or edit existing tasks from this sub-skill.
