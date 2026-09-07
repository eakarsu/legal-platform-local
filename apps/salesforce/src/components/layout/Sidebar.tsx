"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  Settings,
  Home,
  Scale,
  Brain,
  Wallet,
  UserCircle,
  Phone,
  BarChart3,
  CalendarClock,
  ShieldAlert,
  Search,
  Globe,
} from "lucide-react"
import { LogoIcon } from "@/components/ui/logo"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Matters", href: "/matters", icon: Briefcase },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Time & Billing", href: "/time-billing", icon: Clock },
  { name: "Invoices", href: "/invoices", icon: DollarSign },
  { name: "Trust Accounts", href: "/trust", icon: Wallet },
  { name: "Retainer Reconcile", href: "/trust-retainer-reconciliation", icon: Wallet },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Deadlines", href: "/deadlines", icon: AlertCircle },
  { name: "Contacts", href: "/contacts", icon: Phone },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

const aiNavigation = [
  { name: "Document Drafting", href: "/ai/document-drafting", icon: FileText },
  { name: "Legal Research", href: "/ai/legal-research", icon: Scale },
  { name: "Contract Review", href: "/ai/contract-review", icon: Brain },
  { name: "Time Capture", href: "/ai/time-capture", icon: Clock },
  { name: "Case Analysis", href: "/ai/case-analysis", icon: Briefcase },
  { name: "Client Intake", href: "/ai/client-intake", icon: Users },
  { name: "Deadline Predictor", href: "/ai/deadline-predictor", icon: CalendarClock },
  { name: "Conflict Checker", href: "/ai/conflict-checker", icon: ShieldAlert },
  { name: "Opponent Analysis", href: "/ai/opponent-analysis", icon: Search },
  { name: "Multi-Jurisdiction Compliance", href: "/ai/multi-jurisdiction-compliance", icon: Globe },
  { name: "Billing Intelligence", href: "/ai/billing-intelligence", icon: DollarSign },
]

const settingsNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Users", href: "/settings/users", icon: UserCircle },
  { name: "Billing Rates", href: "/settings/billing-rates", icon: DollarSign },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900">
      {/* Logo */}
      <Link href="/dashboard" className="flex h-16 items-center px-6">
        <LogoIcon size={36} />
        <span className="ml-2 text-xl font-bold text-white">GetFirmFlow</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* AI Features */}
        <div className="pt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            AI Features
          </p>
          <div className="mt-2 space-y-1">
            {aiNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Settings
          </p>
          <div className="mt-2 space-y-1">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
