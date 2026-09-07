"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Cloud,
  CheckCircle,
  XCircle,
  ExternalLink,
  Key,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  connected: boolean
  configFields: Array<{ name: string; label: string; type: string; placeholder: string }>
}

export default function IntegrationsPage() {
  const [saving, setSaving] = useState<string | null>(null)

  const integrations: Integration[] = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept credit card payments and process online payments from clients",
      icon: CreditCard,
      connected: false,
      configFields: [
        { name: "publishableKey", label: "Publishable Key", type: "text", placeholder: "pk_..." },
        { name: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_..." },
      ],
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "Voice receptionist and SMS notifications for clients",
      icon: Phone,
      connected: false,
      configFields: [
        { name: "accountSid", label: "Account SID", type: "text", placeholder: "AC..." },
        { name: "authToken", label: "Auth Token", type: "password", placeholder: "Your auth token" },
        { name: "phoneNumber", label: "Phone Number", type: "text", placeholder: "+1..." },
      ],
    },
    {
      id: "smtp",
      name: "Email (SMTP)",
      description: "Send invoices, notifications, and client communications",
      icon: Mail,
      connected: true,
      configFields: [
        { name: "host", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com" },
        { name: "port", label: "Port", type: "text", placeholder: "587" },
        { name: "user", label: "Username", type: "text", placeholder: "your-email@gmail.com" },
        { name: "password", label: "Password", type: "password", placeholder: "App password" },
      ],
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync events and deadlines with Google Calendar",
      icon: Calendar,
      connected: false,
      configFields: [
        { name: "clientId", label: "Client ID", type: "text", placeholder: "Your client ID" },
        { name: "clientSecret", label: "Client Secret", type: "password", placeholder: "Your client secret" },
      ],
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "AI-powered document drafting, legal research, and contract review",
      icon: Cloud,
      connected: true,
      configFields: [
        { name: "apiKey", label: "API Key", type: "password", placeholder: "sk-..." },
        { name: "model", label: "Model", type: "text", placeholder: "gpt-4" },
      ],
    },
    {
      id: "deepgram",
      name: "Deepgram",
      description: "Speech-to-text for voice memos and call transcription",
      icon: Phone,
      connected: false,
      configFields: [
        { name: "apiKey", label: "API Key", type: "password", placeholder: "Your API key" },
      ],
    },
  ]

  const handleSave = async (integrationId: string) => {
    setSaving(integrationId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(null)
  }

  const handleConnect = async (integrationId: string) => {
    // In production, this would initiate OAuth flow or save credentials
    alert(`Connecting to ${integrationId}...`)
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return
    alert(`Disconnecting ${integrationId}...`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect third-party services to enhance your practice management
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <integration.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                {integration.connected ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.configFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      defaultValue={integration.connected ? "••••••••" : ""}
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4">
                {integration.connected ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                    <Button
                      onClick={() => handleSave(integration.id)}
                      disabled={saving === integration.id}
                    >
                      {saving === integration.id ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleConnect(integration.id)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Connect {integration.name}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Settings</CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time updates from external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value="https://your-domain.com/api/webhooks"
                className="font-mono text-sm"
              />
              <Button variant="outline" onClick={() => navigator.clipboard.writeText("https://your-domain.com/api/webhooks")}>
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this URL to configure webhooks in your integrated services
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Webhooks</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when payments are processed
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Calendar Sync</p>
                <p className="text-sm text-muted-foreground">
                  Sync events when calendar is updated externally
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Track when clients open invoices and emails
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
