import { motion } from 'framer-motion'

/**
 * Reusable glassmorphism card container with entrance animation.
 */
export default function GlassCard({
  children,
  className = '',
  animate = true,
  hover = false,
  ...props
}) {
  if (!animate) {
    return (
      <div className={`glass rounded-2xl p-6 ${className}`} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={`glass rounded-2xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      {...(hover
        ? { whileHover: { y: -2, transition: { duration: 0.2 } } }
        : {})}
      {...props}
    >
      {children}
    </motion.div>
  )
}
