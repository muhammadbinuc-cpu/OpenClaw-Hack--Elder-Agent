import { motion } from 'framer-motion'

const methodColor = {
  GET: '#38BDF8',
  POST: '#34D399',
  402: '#F5A524',
  200: '#34D399',
}

/**
 * Terminal-chrome code panel. Pass `lines` as an array of strings already
 * containing <span class="tok-*"> markup, or plain children.
 */
export default function CodePanel({ title, method, status, children, lines, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`code-panel ${className}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <div className="code-panel-bar">
        <span className="code-dot" style={{ background: '#F0556B' }} />
        <span className="code-dot" style={{ background: '#F5A524' }} />
        <span className="code-dot" style={{ background: '#34D399' }} />
        {(title || method || status) && (
          <div className="flex items-center gap-2 ml-3 min-w-0">
            {method && (
              <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: methodColor[method] || '#38BDF8' }}>
                {method}
              </span>
            )}
            {title && (
              <span className="mono truncate" style={{ fontSize: 11, color: '#8A93A6' }}>{title}</span>
            )}
            {status && (
              <span
                className="mono ml-auto shrink-0"
                style={{ fontSize: 10.5, fontWeight: 700, color: methodColor[status] || '#34D399' }}
              >
                {status}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="code-body">
        {lines
          ? lines.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l || '&nbsp;' }} />)
          : children}
      </div>
    </motion.div>
  )
}
