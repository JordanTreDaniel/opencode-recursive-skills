# API limits

Shared rate limits for the tracker API. Check before batching writes.

- Read requests: 100 / minute per session token.
- Write requests: 25 / minute per session token.
- Batch create: max 20 items per request.
- Search / query: max 100 results per page; paginate past that.

A `429` means back off and retry with exponential delay. Do not loop tightly.
