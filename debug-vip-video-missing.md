# [OPEN] VIP video row not showing

## Symptom
- VIP Video row does not appear on Home even though user has 2 VIP videos.

## Expected
- VIP Video row appears with up to 4 cards when at least one listing has a video.

## Hypotheses
- **A**: The VIP video fetch returns 0 rows due to an API filter mismatch (PostgREST JSON filter / RLS / column mismatch).
- **B**: The fetch returns rows, but `hasListingVideo()` evaluates false because `details.video_url` / `details.video_path` are not present in returned data shape.
- **C**: The row is being hidden by UI state gates (e.g., `homeInitialListingsLoading`, section not `home-section`, DOM not found).
- **D**: The fetch runs but the result is overwritten/reset (e.g., key caching, filters key mismatch, rerender timing).
- **E**: Active filters (category/search/wilaya/price) exclude the 2 VIP videos, so result is legitimately empty.

## Evidence to Collect
- Supabase response: `error`, `data.length`
- Computed `picked.length` after `hasListingVideo()` filtering
- Current filters key
- Render gating state: `homeInitialListingsLoading`, `homeInitialListingsLoaded`, active section, DOM availability

## Runs
- pre-fix: pending
- post-fix: pending

## Evidence (Collected)
- Vercel console debug events show:
  - `A:primary.error = "Could not embed because more than one relationship was found for 'listings' and 'profiles'"`
  - `C:render-state.itemsLen = 0`
