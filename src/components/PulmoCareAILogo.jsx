import React from 'react';

const PulmoCareAILogo = ({ className = "h-8 w-8", color = "currentColor" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lung shape with AI circuit pattern */}
      <g>
        {/* Left lung */}
        <path
          d="M25 20C20 20 15 25 15 30V55C15 65 20 70 25 70C30 70 35 65 35 55V30C35 25 30 20 25 20Z"
          fill={color}
          fillOpacity="0.8"
        />
        
        {/* Right lung */}
        <path
          d="M65 20C60 20 55 25 55 30V55C55 65 60 70 65 70C70 70 75 65 75 55V30C75 25 70 20 65 20Z"
          fill={color}
          fillOpacity="0.8"
        />
        
        {/* Trachea/bronchi */}
        <path
          d="M45 15C43 15 42 16 42 18V35C42 37 43 38 45 38C47 38 48 37 48 35V18C48 16 47 15 45 15Z"
          fill={color}
        />
        
        {/* Bronchi branches */}
        <path
          d="M42 30L35 35M48 30L55 35"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* AI Circuit pattern overlay */}
        <g opacity="0.6">
          {/* Circuit nodes */}
          <circle cx="25" cy="35" r="2" fill={color} />
          <circle cx="25" cy="45" r="2" fill={color} />
          <circle cx="25" cy="55" r="2" fill={color} />
          <circle cx="65" cy="35" r="2" fill={color} />
          <circle cx="65" cy="45" r="2" fill={color} />
          <circle cx="65" cy="55" r="2" fill={color} />
          
          {/* Circuit connections */}
          <path
            d="M25 37V43M25 47V53M65 37V43M65 47V53"
            stroke={color}
            strokeWidth="1"
          />
          
          {/* Cross connections for AI network */}
          <path
            d="M27 45H63"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </g>
        
        {/* Medical cross indicator */}
        <g transform="translate(40, 75)">
          <rect x="3" y="0" width="4" height="10" fill={color} rx="1" />
          <rect x="0" y="3" width="10" height="4" fill={color} rx="1" />
        </g>
        
        {/* AI brain indicator */}
        <g transform="translate(75, 15)" opacity="0.8">
          <circle cx="5" cy="5" r="4" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="3" cy="4" r="0.5" fill={color} />
          <circle cx="7" cy="4" r="0.5" fill={color} />
          <circle cx="5" cy="6" r="0.5" fill={color} />
        </g>
      </g>
    </svg>
  );
};

export default PulmoCareAILogo;