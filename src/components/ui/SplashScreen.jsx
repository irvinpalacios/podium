import { motion } from 'framer-motion'
import Logo from './Logo'
import { useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 950)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 bg-tarmac flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Logo size={56} theme="dark" />
      </motion.div>
    </motion.div>
  )
}
