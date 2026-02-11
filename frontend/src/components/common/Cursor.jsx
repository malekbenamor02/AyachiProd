import React, { useEffect } from 'react'
import { useCursor } from '../../hooks/useCursor'
import '../../styles/index.css'

const Cursor = () => {
  useCursor()

  return <div className="cursor"></div>
}

export default Cursor
