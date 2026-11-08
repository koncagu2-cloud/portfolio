import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { easeOutSoft } from '../../styles/motion.js'

export function ImageLightbox({ open, onClose, src, alt }) {
  const titleId = useId()
  const show = open && src

  useEffect(() => {
    if (!show) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [show, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {show ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: easeOutSoft }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Close image"
            onClick={onClose}
          />
          <motion.div
            className="relative z-[1] max-h-[90vh] max-w-[min(96vw,1200px)]"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeOutSoft }}
          >
            <span id={titleId} className="sr-only">
              Enlarged: {alt || 'Image'}
            </span>
            <img
              src={src}
              alt={alt || ''}
              className="max-h-[85vh] w-auto max-w-full rounded-xl border border-white/10 object-contain shadow-[0_0_80px_rgba(124,58,237,0.15)]"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute -right-1 -top-12 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 transition hover:bg-white/15 sm:right-0 sm:top-0 sm:translate-x-full sm:translate-x-3"
            >
              Close · Esc
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
