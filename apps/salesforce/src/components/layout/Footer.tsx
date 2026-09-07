"use client"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container flex h-14 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} GetFirmFlow. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
