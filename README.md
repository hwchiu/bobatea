# bobatea

## Server deployment

`bobatea` can run entirely from a Linux host without GitHub Pages:

1. Build the frontend with the default `NEXT_PUBLIC_BASE_PATH=/bobatea` and copy `out/` to `/var/www/bobatea/`.
2. Run the FastAPI backend on `127.0.0.1:8000`.
3. Let nginx serve `/bobatea/` from `/var/www/bobatea/` and proxy same-origin `/api/*` to the backend.

Reference configs for that setup live in `deploy/`.

For the GitHub Pages deployment, the frontend is built with:

```text
NEXT_PUBLIC_API_BASE=https://momo.hwchiu.com
```

That keeps the browser on HTTPS and lets the static UI call the server backend cross-origin. Do not point the GitHub-hosted frontend at `http://momo.hwchiu.com:80`, because browsers block mixed-content API calls from an HTTPS page.

### AI provider key

If `PERPLEXITY_API_KEY` is not set for the backend service, AI dry-run calls still work but return the backend's built-in mock response.

### Public cutover note

The current public `www.hwchiu.com` traffic is still routed outside this host. To make the server deployment live for `https://www.hwchiu.com/bobatea/`, the domain or path routing in front of `www.hwchiu.com` must be moved to this machine.
