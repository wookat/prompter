/**
 * Build-time prerender entry: renders the real page components to static
 * HTML so crawlers (and the first paint) get full content in #root before
 * React mounts. Bundled with esbuild by build-seo.mjs and run in Node.
 */
// Speech recognition exists in the browsers most visitors use; stub it so
// the prerendered markup includes the Voice button and matches the client.
const g = globalThis as unknown as Record<string, unknown>
g.window = globalThis
g.webkitSpeechRecognition = class {}

const { renderToString } = await import('react-dom/server')
const { MemoryRouter } = await import('react-router-dom')
const { default: Home } = await import('@/pages/Home')
const { default: UseCase } = await import('@/pages/UseCase')

export function renderRoute(path: string): string {
  const Page = path === '/' ? Home : UseCase
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <Page />
    </MemoryRouter>,
  )
}
