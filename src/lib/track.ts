export type TrackEvent =
  | 'page_view'
  | 'prompter_start'
  | 'prompter_finish'
  | 'script_save'
  | 'mirror_on'

export function track(event: TrackEvent): void {
  try {
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    /* analytics must never break the app */
  }
}
