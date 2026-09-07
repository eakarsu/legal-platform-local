"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Scale,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Gavel,
  MessageSquare,
  Brain,
  Settings,
  LogOut,
  ChevronDown,
  ListTodo,
  Receipt,
  AlertTriangle,
  Bell
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Matters', href: '/matters', icon: Briefcase },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Deadlines', href: '/deadlines', icon: AlertTriangle },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Time Tracking', href: '/time', icon: Clock },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'Court Filings', href: '/filings', icon: Gavel },
  { name: 'Service Tracker', href: '/filing-service-tracker', icon: Gavel },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'AI Assistant', href: '/ai', icon: Brain },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Scale className="w-5 h-5 text-gray-900" />
        </div>
        <span className="text-xl font-bold text-white">LegalFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-800 hover:text-white">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-700 text-white text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Attorney'}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
