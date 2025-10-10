import React from 'react'
import { formatVersion } from '@/lib/version'

interface VersionBadgeProps {
  className?: string
  variant?: 'default' | 'subtle' | 'header'
  format?: 'short' | 'full' | 'date'
}

export function VersionBadge({ 
  className = '', 
  variant = 'default',
  format = 'short'
}: VersionBadgeProps) {
  const baseClasses = "inline-flex items-center gap-1 text-xs"
  
  const variantClasses = {
    default: "px-2 py-1 bg-gray-100 text-gray-600 rounded-full",
    subtle: "text-gray-400",
    header: "px-2 py-1 bg-gray-50 text-gray-400 rounded"
  }

  const versionText = formatVersion(format)

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {format === 'short' ? (
        <>
          <span>V1</span>
          <span>•</span>
          <span>10 Octobre</span>
        </>
      ) : (
        <span>{versionText}</span>
      )}
    </div>
  )
} 