import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Shield, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!profile) return '/login'
    switch (profile.role) {
      case 'member':
        return '/member/dashboard'
      case 'admin':
        return '/admin/dashboard'
      case 'super_admin':
        return '/super-admin/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to={getDashboardPath()} className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">RoleSphere</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/settings/profile">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              {profile?.role === 'super_admin' && (
                <Link to="/super-admin/policies">
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
