import { useEffect } from 'react'

export const useCursor = () => {
  useEffect(() => {
    const cursor = document.querySelector('.cursor')
    if (!cursor) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let isHoveringInteractive = false

    const lerp = (start, end, factor) => start + (end - start) * factor

    const updateCursor = () => {
      cursorX = lerp(cursorX, mouseX, 0.15)
      cursorY = lerp(cursorY, mouseY, 0.15)
      const scale = isHoveringInteractive ? 'scale(2.5)' : 'scale(1)'
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) ${scale}`
      requestAnimationFrame(updateCursor)
    }

    // Track mouse movement
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Detect mobile device
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window

    if (isMobile) {
      cursor.style.display = 'none'
      document.body.style.cursor = 'auto'
      return
    }

    // Scale cursor on hover (skip .marquee-item to avoid lag over the scrolling strip)
    const interactiveElements = document.querySelectorAll('a, button, .project-item')

    const onEnter = () => { isHoveringInteractive = true }
    const onLeave = () => { isHoveringInteractive = false }
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    document.addEventListener('mousemove', handleMouseMove)
    updateCursor()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])
}
