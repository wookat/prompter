import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderState = 'off' | 'starting' | 'recording' | 'error'

export const recordingSupported = () =>
  typeof window !== 'undefined' &&
  typeof MediaRecorder !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia

const pickMimeType = () => {
  const candidates = [
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

const download = (blob: Blob, mimeType: string) => {
  const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm'
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `promptcue-take-${stamp}.${ext}`
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Camera + mic recording that saves the take to the device on stop.
 * Everything stays local: the stream feeds a MediaRecorder whose blob is
 * offered as a download — nothing is uploaded.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>('off')
  const streamRef = useRef<MediaStream | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewRef = useRef<HTMLVideoElement | null>(null)

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recRef.current = null
  }, [])

  const stop = useCallback(() => {
    const rec = recRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    else cleanup()
    setState('off')
  }, [cleanup])

  const start = useCallback(async () => {
    if (!recordingSupported()) {
      setState('error')
      return
    }
    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      streamRef.current = stream
      const mimeType = pickMimeType()
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const type = rec.mimeType || mimeType || 'video/webm'
        if (chunksRef.current.length > 0) {
          download(new Blob(chunksRef.current, { type }), type)
        }
        chunksRef.current = []
        cleanup()
      }
      rec.start(1000)
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        void previewRef.current.play().catch(() => undefined)
      }
      setState('recording')
    } catch {
      cleanup()
      setState('error')
    }
  }, [cleanup])

  const toggle = useCallback(() => {
    if (state === 'recording' || state === 'starting') stop()
    else void start()
  }, [state, start, stop])

  // Attach the live stream to the preview element once it mounts
  const attachPreview = useCallback((el: HTMLVideoElement | null) => {
    previewRef.current = el
    if (el && streamRef.current) {
      el.srcObject = streamRef.current
      void el.play().catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    return () => {
      const rec = recRef.current
      if (rec && rec.state !== 'inactive') rec.stop()
      else {
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return { state, toggle, attachPreview }
}
