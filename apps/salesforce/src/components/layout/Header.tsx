"use client"

import { useSession, signOut } from "next-auth/react"
import { Bell, Search, Clock, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function Header() {
  const { data: session } = useSession()
  const [timerOpen, setTimerOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startTimer = () => {
    setIsRunning(true)
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    // Store interval ID for cleanup
    ;(window as unknown as { timerInterval: NodeJS.Timeout }).timerInterval = interval
  }

  const stopTimer = () => {
    setIsRunning(false)
    clearInterval((window as unknown as { timerInterval: NodeJS.Timeout }).timerInterval)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSeconds(0)
    clearInterval((window as unknown as { timerInterval: NodeJS.Timeout }).timerInterval)
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        {/* Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search clients, matters, documents..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Timer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimerOpen(true)}
            className="flex items-center"
          >
            <Clock className="mr-2 h-4 w-4" />
            {isRunning ? formatTime(seconds) : "Start Timer"}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.firstName?.[0]}
                  {session?.user?.lastName?.[0]}
                </div>
                <span className="text-sm font-medium">
                  {session?.user?.firstName} {session?.user?.lastName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session?.user?.name}</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Timer Dialog */}
      <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Time Entry</DialogTitle>
            <DialogDescription>
              Track your time and add it to a matter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Timer Display */}
            <div className="text-center">
              <span className="text-4xl font-mono font-bold">{formatTime(seconds)}</span>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-2">
              {!isRunning ? (
                <Button onClick={startTimer}>Start</Button>
              ) : (
                <Button onClick={stopTimer} variant="destructive">Stop</Button>
              )}
              <Button onClick={resetTimer} variant="outline">Reset</Button>
            </div>

            <div className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label>Matter</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a matter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m1">Anderson Divorce</SelectItem>
                    <SelectItem value="m2">Wilson v. Metro Transit</SelectItem>
                    <SelectItem value="m3">Tech Innovations - Series A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Activity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a108">A108 - Client communications</SelectItem>
                    <SelectItem value="a106">A106 - Research</SelectItem>
                    <SelectItem value="a103">A103 - Document review</SelectItem>
                    <SelectItem value="a107">A107 - Draft pleadings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the work performed..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Save time entry logic here
              setTimerOpen(false)
              resetTimer()
            }}>
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
