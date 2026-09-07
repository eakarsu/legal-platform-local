"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Users,
  Building2,
  DollarSign,
} from "lucide-react"
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils"

interface Client {
  id: string
  clientNumber: string
  type: string
  status: string
  firstName?: string
  lastName?: string
  companyName?: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  referralSource?: string
  notes?: string
  createdAt: string
  matters: Array<{
    id: string
    matterNumber: string
    name: string
    status: string
    practiceArea: { name: string; color: string }
    _count: { timeEntries: number; documents: number }
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    createdAt: string
  }>
  trustLedgers: Array<{
    id: string
    balance: number
    trustAccount: { name: string }
  }>
  _count: { matters: number; documents: number }
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setClient(data)
        } else {
          router.push("/clients")
        }
      } catch (error) {
        console.error("Failed to fetch client:", error)
        router.push("/clients")
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (!client) {
    return null
  }

  const clientName =
    client.type === "BUSINESS" || client.type === "NONPROFIT"
      ? client.companyName
      : `${client.firstName} ${client.lastName}`

  const totalTrustBalance = client.trustLedgers.reduce(
    (sum, ledger) => sum + Number(ledger.balance),
    0
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {client.type === "BUSINESS" || client.type === "NONPROFIT" ? (
                <Building2 className="h-8 w-8 text-primary" />
              ) : (
                <Users className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{clientName}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">{client.clientNumber}</span>
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
                <Badge variant="outline">{client.type}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/matters/new?clientId=${client.id}`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Matter
            </Button>
          </Link>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matters</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.matters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.documents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTrustBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(client.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matters">Matters ({client.matters.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.mobile && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.mobile} (Mobile)</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{client.address}</p>
                      <p>{client.city}, {client.state} {client.zip}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.referralSource && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Referral Source</p>
                    <p>{client.referralSource}</p>
                  </div>
                )}
                {client.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matters">
          <Card>
            <CardContent className="p-0">
              {client.matters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No matters yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new matter for this client
                  </p>
                  <Link href={`/matters/new?clientId=${client.id}`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Matter
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matter</TableHead>
                      <TableHead>Practice Area</TableHead>
                      <TableHead>Time Entries</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.matters.map((matter) => (
                      <TableRow
                        key={matter.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => router.push(`/matters/${matter.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{matter.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {matter.matterNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{ backgroundColor: matter.practiceArea.color }}
                            className="text-white"
                          >
                            {matter.practiceArea.name}
                          </Badge>
                        </TableCell>
                        <TableCell>{matter._count.timeEntries}</TableCell>
                        <TableCell>{matter._count.documents}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(matter.status)}>
                            {matter.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-0">
              {client.documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No documents yet</h3>
                  <p className="text-muted-foreground">
                    Upload documents from matter pages
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.documents.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => router.push(`/documents/${doc.id}`)}
                      >
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid gap-4">
            {/* Trust Balances */}
            <Card>
              <CardHeader>
                <CardTitle>Trust Account Balances</CardTitle>
              </CardHeader>
              <CardContent>
                {client.trustLedgers.length === 0 ? (
                  <p className="text-muted-foreground">No trust accounts</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.trustLedgers.map((ledger) => (
                        <TableRow key={ledger.id}>
                          <TableCell>{ledger.trustAccount.name}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(ledger.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
