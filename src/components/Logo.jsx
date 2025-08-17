import React from 'react'

const Logo = ({ size = 40, className = '' }) => {
  return (
    <div className={`logo ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Main circle background */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="url(#logoGradient)"
          filter="url(#shadow)"
        />
        
        {/* Snowflake icon */}
        <g transform="translate(20, 20)" fill="white">
          {/* Main cross */}
          <line x1="-8" y1="0" x2="8" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="0" y1="-8" x2="0" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Diagonal lines */}
          <line x1="-6" y1="-6" x2="6" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="-6" y1="6" x2="6" y2="-6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          
          {/* Small decorative elements */}
          <circle cx="-6" cy="0" r="1" fill="white"/>
          <circle cx="6" cy="0" r="1" fill="white"/>
          <circle cx="0" cy="-6" r="1" fill="white"/>
          <circle cx="0" cy="6" r="1" fill="white"/>
          
          {/* Corner decorations */}
          <circle cx="-4" cy="-4" r="0.8" fill="white"/>
          <circle cx="4" cy="-4" r="0.8" fill="white"/>
          <circle cx="-4" cy="4" r="0.8" fill="white"/>
          <circle cx="4" cy="4" r="0.8" fill="white"/>
        </g>
      </svg>
    </div>
  )
}

export default Logo
