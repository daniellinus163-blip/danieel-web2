import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

type RoleRequest = {
  id: string
  user_id: string
  requested_role: string
  status: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function RoleRequestsPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [requests, setRequests] = useState<RoleRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.role !== 'super_admin') {
      navigate('/')
      return
    }
    fetchRequests()
  }, [profile, navigate])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('role_requests')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch role requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('approve_role_request', {
        request_id: requestId
      })

      if (error) throw error

      toast.success('Role request approved')
      fetchRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('reject_role_request', {
        request_id: requestId
      })

      if (error) throw error

      toast.success('Role request rejected')
      fetchRequests()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Role Requests</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Requests</h1>
          <p className="text-gray-600">Approve or reject requests for Admin and Super Admin roles</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No pending role requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests
              .filter(req => req.status === 'pending')
              .map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.profiles?.full_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">{request.profiles?.email}</p>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Requested: {request.requested_role.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
