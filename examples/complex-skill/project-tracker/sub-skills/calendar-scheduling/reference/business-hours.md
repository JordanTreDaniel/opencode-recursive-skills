# Business hours

Working-day bounds used when intersecting availability. Slots outside these
bounds are not offered even if a calendar is technically free.

- Weekdays only; weekends are offered only on explicit request.
- Working day: 09:00–17:00 in the host's local time.
- Minimum slot: 15 minutes; default duration: 30 minutes.
- Leave a 15-minute buffer at the start of the working day.

Convert the bounds into the host's timezone before intersecting; see
`timezones.md` for IANA labels.
