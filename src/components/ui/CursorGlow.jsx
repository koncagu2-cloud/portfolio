import { useEffect, useMemo, useRef } from 'react'

export function CursorGlow() {
  const ref = useRef(null)
  const supportsReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,
    [],
  )

  useEffect(() => {
    if (supportsReducedMotion) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      raf = 0
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [supportsReducedMotion])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[0] h-0 w-0"
    >
      <div className="h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,.18),transparent_60%)] blur-2xl" />
      <div className="mt-[-520px] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,.10),transparent_58%)] blur-3xl" />
    </div>
  )
}

