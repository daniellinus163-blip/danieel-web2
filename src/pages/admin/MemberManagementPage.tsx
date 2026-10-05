import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Search, Shield, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function MemberManagementPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [changingRole, setChangingRole] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'member')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (targetUserId: string, newRole: 'admin') => {
    if (!user) return

    try {
      setChangingRole(targetUserId)

      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
      })

      if (error) throw error

      toast.success('Member promoted to admin successfully')
      await fetchProfiles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change role')
    } finally {
      setChangingRole(null)
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    return 
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
          <p className="mt-2 text-gray-600">View and manage members</p>
        </div>
        <Link to="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Members: {profiles.length}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredProfiles.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No members found</p>
            ) : (
              filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {profile.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{profile.full_name}</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-purple-100 text-purple-700">
                      {profile.role.replace('_', ' ')}
                    </span>

                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value as 'admin')}
                      disabled={changingRole === profile.id}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Promote to Admin</option>
                    </select>

                    {changingRole === profile.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
