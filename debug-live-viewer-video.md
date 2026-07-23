# Debug Session: live-viewer-video
- **Status**: [OPEN]
- **Issue**: Host mobile account receives repeated camera/microphone permission toasts while live, and viewer gets audio but no video.
- **Debug Server**: Pending startup
- **Log File**: .dbg/trae-debug-log-live-viewer-video.ndjson

## Reproduction Steps
1. Start a live session on mobile with the broadcaster account.
2. Open the same live from another account on desktop.
3. Observe repeated permission toasts on mobile.
4. Observe desktop viewer receives audio but no visible video.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | Broadcaster path re-runs `getUserMedia()` during viewer/presence sync, causing repeated permission failures/toasts. | High | Low | Pending |
| B | Broadcaster peer connection is publishing audio only because the local video track is missing, muted, or disabled. | High | Med | Pending |
| C | Viewer peer receives a media stream, but the video track is absent or not attached to the DOM/video element correctly. | High | Med | Pending |
| D | Presence sync repeatedly recreates WebRTC peer connections, causing renegotiation loops and unstable media publication. | Med | Med | Pending |
| E | Mobile browser permission/state differs between studio boot and later broadcast-offer creation, so the offer path fails even if initial live UI loads. | Med | Med | Pending |

## Log Evidence
- Pending instrumentation

## Verification Conclusion
- Pending
