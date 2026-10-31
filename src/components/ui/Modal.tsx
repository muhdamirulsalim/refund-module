import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose?: () => void
  summary?: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({
  title,
  children,
  onClose,
  summary,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const widthClass = size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onClose) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-[90vh] w-full ${widthClass} flex-col overflow-hidden rounded-xl bg-white shadow-xl`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              ✕
            </button>
          ) : null}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {summary ? (
          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3">
            {summary}
          </div>
        ) : null}
        {footer ? (
          <footer className="shrink-0 border-t border-slate-200 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
