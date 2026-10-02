import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Users, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import ProfileImageUpload from '@/components/profile/ProfileImageUpload'

export default function MemberDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()

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
            <h1 className="text-xl font-bold text-gray-900">Member Dashboard</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {profile?.full_name}!</p>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              Browse and search other member profiles
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
    </div>
  )
}
