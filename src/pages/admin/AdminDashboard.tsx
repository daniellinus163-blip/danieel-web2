import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Users, Shield } from 'lucide-react'
import ProfileImageUpload from '@/components/profile/ProfileImageUpload'

export default function AdminDashboard() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {profile?.full_name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>Member Directory</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View and search member profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle>Admin Directory</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View other admin profiles
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileImageUpload />
        </CardContent>
      </Card>

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
