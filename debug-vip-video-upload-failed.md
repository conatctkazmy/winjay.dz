[OPEN] Debug session: vip-video-upload-failed

## Symptom
- Toast: "Video upload request failed"
- Expected: should obtain signed upload URL from Edge Function and upload video to Storage

## Hypotheses (falsifiable)
- H1: Edge Function endpoint unreachable from browser (DNS/CORS/network), fetch throws before response.
- H2: `SUPABASE_PROJECT_URL` is incorrect at runtime (wrong base URL), causing fetch to a bad domain/path.
- H3: Auth token missing/expired, request never sent or blocked by browser due to header/CORS issues.
- H4: Edge Function exists but returns non-JSON / non-2xx; client parsing/handling path leads to generic toast.
- H5: Local environment blocks requests (mixed content, adblock, browser privacy, or service worker).

## Instrumentation plan
- Add debug reporter that POSTs events to local Debug Server.
- Instrument:
  - start/end of signed URL request (URL, listingId, token present, status/body length)
  - fetch exceptions (name/message)
  - PUT upload status + response text (if any)

## Evidence
- Pre-fix run: pending
- Post-fix run: pending

## Next actions
- Start Debug Server.
- Reproduce upload once.
- Collect logs and confirm which hypothesis matches.

