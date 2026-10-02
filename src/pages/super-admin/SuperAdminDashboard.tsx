import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Users, Shield, Settings, FileText, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SuperAdminDashboard() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {profile?.full_name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <CardTitle>My Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View and edit your personal profile information
            </p>
          </CardContent>
        </Card>

        <Link to="users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <CardTitle>All Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage all users and roles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="policies">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <CardTitle>Image Policies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configure global image permissions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="role-requests">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <CardTitle>Role Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Approve or reject admin/super admin requests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="audit-logs">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <CardTitle>Audit Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View role change history
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Name:</span>
            <span className="text-sm text-gray-900">{profile?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Email:</span>
            <span className="text-sm text-gray-900">{profile?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Role:</span>
            <span className="text-sm text-gray-900 capitalize">{profile?.role?.replace('_', ' ')}</span>
          </div>
          {profile?.bio && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Bio:</span>
              <span className="text-sm text-gray-900">{profile.bio}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
