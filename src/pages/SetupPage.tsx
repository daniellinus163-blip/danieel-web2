import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Shield, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function SetupPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)

  const handlePromoteToSuperAdmin = async () => {
    if (!user) {
      toast.error('You must be logged in')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.rpc('promote_first_user_to_super_admin')

      if (error) throw error

      toast.success('Successfully promoted to Super Admin!')
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Failed to promote to super admin')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Please log in first to set up the initial super admin account.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 px-4">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Setup</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Initial Setup</CardTitle>
            <p className="text-sm text-gray-600">
              Create the first Super Admin account
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Current User:</strong> {profile?.full_name || user.email}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Current Role:</strong> {profile?.role || 'member'}
              </p>
            </div>

            <p className="text-sm text-gray-600">
              This will promote your account to Super Admin. This action can only be performed once
              to establish the initial administrator.
            </p>

            <Button
              onClick={handlePromoteToSuperAdmin}
              className="w-full"
              disabled={loading || profile?.role === 'super_admin'}
            >
              {loading ? 'Promoting...' : profile?.role === 'super_admin' ? 'Already Super Admin' : 'Promote to Super Admin'}
            </Button>

            {profile?.role === 'super_admin' && (
              <Button
                onClick={() => navigate('/super-admin/dashboard')}
                variant="outline"
                className="w-full"
              >
                Go to Super Admin Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
