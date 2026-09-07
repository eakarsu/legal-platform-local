import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "default" | "dark" | "icon"
  size?: "sm" | "md" | "lg"
  href?: string
  className?: string
}

export function Logo({ variant = "default", size = "md", href = "/", className = "" }: LogoProps) {
  const sizes = {
    sm: { width: 140, height: 35 },
    md: { width: 180, height: 45 },
    lg: { width: 220, height: 55 },
  }

  const iconSizes = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 50, height: 50 },
  }

  const currentSize = variant === "icon" ? iconSizes[size] : sizes[size]
  const src = variant === "dark" ? "/logo-dark.svg" : variant === "icon" ? "/logo-icon.svg" : "/logo.svg"

  const logoElement = (
    <Image
      src={src}
      alt="GetFirmFlow"
      width={currentSize.width}
      height={currentSize.height}
      className={className}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}

// Inline SVG version for cases where we need more control
export function LogoInline({
  variant = "default",
  className = ""
}: {
  variant?: "default" | "dark"
  className?: string
}) {
  const isDark = variant === "dark"

  return (
    <svg
      width="180"
      height="45"
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Flow lines */}
      <path
        d="M8 15 Q15 10 22 15 Q29 20 36 15"
        stroke={isDark ? "#60A5FA" : "#2563EB"}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M8 25 Q15 20 22 25 Q29 30 36 25"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M8 35 Q15 30 22 35 Q29 40 36 35"
        stroke={isDark ? "#2563EB" : "#60A5FA"}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Text */}
      <text x="46" y="33" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="600">
        <tspan fill={isDark ? "#94A3B8" : "#64748B"}>Get</tspan>
        <tspan fill={isDark ? "#F1F5F9" : "#1E293B"}>Firm</tspan>
        <tspan fill={isDark ? "#60A5FA" : "#2563EB"}>Flow</tspan>
      </text>
    </svg>
  )
}

// Icon only version
export function LogoIcon({
  size = 40,
  className = ""
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="50" height="50" rx="10" fill="#2563EB"/>
      <path d="M12 17 Q19 12 26 17 Q33 22 40 17" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M12 25 Q19 20 26 25 Q33 30 40 25" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M12 33 Q19 28 26 33 Q33 38 40 33" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  )
}
