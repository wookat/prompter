export type TrackEvent =
  | 'page_view'
  | 'prompter_start'
  | 'prompter_finish'
  | 'script_save'
  | 'script_import'
  | 'mirror_on'
  | 'voice_on'
  | 'record_on'
  | 'usecase_view'

export function track(event: TrackEvent, slug?: string): void {
  try {
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(slug ? { event, slug } : { event }),
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    /* analytics must never break the app */
  }
}
