import { useEffect } from 'react'

export const useCursor = () => {
  useEffect(() => {
    const cursor = document.querySelector('.cursor')
    if (!cursor) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window
    if (isMobile) {
      cursor.style.display = 'none'
      document.body.style.cursor = 'auto'
      return
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let cursorX = mouseX
    let cursorY = mouseY
    let isHoveringInteractive = false
    let rafId = null
    let isTicking = false

    const BASE_LERP = 0.18
    const FAST_LERP = 0.32
    const FAST_DISTANCE = 60
    const MIN_DELTA = 0.1

    const applyTransform = () => {
      const scale = isHoveringInteractive ? 2.5 : 1
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(${scale})`
    }

    const updateCursor = () => {
      const dx = mouseX - cursorX
      const dy = mouseY - cursorY
      const distance = Math.hypot(dx, dy)
      const lerp = distance > FAST_DISTANCE ? FAST_LERP : BASE_LERP

      cursorX += dx * lerp
      cursorY += dy * lerp

      if (Math.abs(dx) <= MIN_DELTA && Math.abs(dy) <= MIN_DELTA) {
        cursorX = mouseX
        cursorY = mouseY
      }

      applyTransform()

      const shouldContinue = Math.abs(mouseX - cursorX) > MIN_DELTA || Math.abs(mouseY - cursorY) > MIN_DELTA
      if (shouldContinue) {
        rafId = requestAnimationFrame(updateCursor)
      } else {
        isTicking = false
        rafId = null
      }
    }

    const scheduleUpdate = () => {
      // Run the animation loop only when needed to avoid constant repainting
      if (!isTicking) {
        isTicking = true
        rafId = requestAnimationFrame(updateCursor)
      }
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      const dx = Math.abs(mouseX - cursorX)
      const dy = Math.abs(mouseY - cursorY)
      if (dx > 200 || dy > 200) {
        cursorX = mouseX
        cursorY = mouseY
        applyTransform()
        return
      }

      scheduleUpdate()
    }

    const onEnter = () => {
      isHoveringInteractive = true
      applyTransform()
    }

    const onLeave = () => {
      isHoveringInteractive = false
      applyTransform()
    }

    const interactiveElements = document.querySelectorAll('a, button, .project-item')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    document.addEventListener('mousemove', handleMouseMove)
    applyTransform()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])
}
