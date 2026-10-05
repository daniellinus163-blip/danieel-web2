import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Search, Shield, Loader2, Plus, X, Eye } from 'lucide-react'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UserManagementPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'member' | 'admin' | 'super_admin'>('all')
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [newMember, setNewMember] = useState({ email: '', fullName: '', password: '' })

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (targetUserId: string, newRole: 'member' | 'admin' | 'super_admin') => {
    if (!user) return

    try {
      setChangingRole(targetUserId)

      const { error } = await supabase.rpc('change_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
      })

      if (error) throw error

      toast.success('Role changed successfully')
      await fetchProfiles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change role')
    } finally {
      setChangingRole(null)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.fullName || !newMember.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setAddingMember(true)

      const { error } = await supabase.auth.signUp({
        email: newMember.email,
        password: newMember.password,
        options: {
          data: {
            full_name: newMember.fullName,
          },
        },
      })

      if (error) throw error

      toast.success('Member added successfully! They will need to confirm their email.')
      setNewMember({ email: '', fullName: '', password: '' })
      setShowAddMemberModal(false)
      await fetchProfiles()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile)
    setShowProfileModal(true)
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleCounts = () => {
    return {
      member: profiles.filter(p => p.role === 'member').length,
      admin: profiles.filter(p => p.role === 'admin').length,
      super_admin: profiles.filter(p => p.role === 'super_admin').length,
    }
  }

  const counts = getRoleCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="mt-2 text-gray-600">Manage user roles and permissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{counts.member}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{counts.admin}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{counts.super_admin}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <Button onClick={() => setShowAddMemberModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
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
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredProfiles.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users found</p>
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
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-purple-100 text-purple-700">
                      {profile.role.replace('_', ' ')}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProfile(profile)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {profile.id !== user?.id && (
                      <select
                        value={profile.role}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value as any)}
                        disabled={changingRole === profile.id}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    )}

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

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Member</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddMemberModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <Button
                onClick={handleAddMember}
                disabled={addingMember}
                className="w-full"
              >
                {addingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowProfileModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl font-bold">
                  {selectedProfile.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-lg">{selectedProfile.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedProfile.email}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Role:</span>
                  <span className="text-sm text-gray-900 capitalize">{selectedProfile.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Joined:</span>
                  <span className="text-sm text-gray-900">{new Date(selectedProfile.created_at).toLocaleDateString()}</span>
                </div>
                {selectedProfile.bio && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Bio:</span>
                    <span className="text-sm text-gray-900">{selectedProfile.bio}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className="text-sm text-gray-900">{selectedProfile.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
