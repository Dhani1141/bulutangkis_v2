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
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...(hover
        ? { 
            whileHover: { y: -2, transition: { type: "spring", stiffness: 400, damping: 30 } },
            whileTap: { scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 30 } }
          }
        : {})}
      {...props}
    >
      {children}
    </motion.div>
  )
}
