import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Upload, Download, Trash2, Loader2 } from 'lucide-react'

type ImagePolicy = {
  id: string
  allow_upload: boolean
  allow_retrieval: boolean
  allow_deletion: boolean
  updated_by: string | null
  updated_at: string
}

export default function ImagePolicySettings() {
  const { user } = useAuth()
  const [policy, setPolicy] = useState<ImagePolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPolicy()
  }, [])

  const fetchPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('image_policies')
        .select('*')
        .single()

      if (error) throw error
      setPolicy(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch image policies')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (field: keyof ImagePolicy, value: boolean) => {
    if (!policy || !user) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from('image_policies')
        .update({
          [field]: value,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', policy.id)

      if (error) throw error

      setPolicy({ ...policy, [field]: value })
      toast.success('Image policy updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update image policy')
    } finally {
      setSaving(false)
    }
  }

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
        <h2 className="text-2xl font-bold text-gray-900">Image Policy Settings</h2>
        <p className="mt-2 text-gray-600">
          Configure global permissions for profile image operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Upload</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Allow users to upload profile pictures
            </p>
            <Button
              onClick={() => handleToggle('allow_upload', !policy?.allow_upload)}
              disabled={saving}
              variant={policy?.allow_upload ? 'default' : 'outline'}
              className="w-full"
            >
              {policy?.allow_upload ? 'Enabled' : 'Disabled'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Retrieval</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Allow users to view profile pictures
            </p>
            <Button
              onClick={() => handleToggle('allow_retrieval', !policy?.allow_retrieval)}
              disabled={saving}
              variant={policy?.allow_retrieval ? 'default' : 'outline'}
              className="w-full"
            >
              {policy?.allow_retrieval ? 'Enabled' : 'Disabled'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Deletion</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Allow users to delete profile pictures
            </p>
            <Button
              onClick={() => handleToggle('allow_deletion', !policy?.allow_deletion)}
              disabled={saving}
              variant={policy?.allow_deletion ? 'default' : 'outline'}
              className="w-full"
            >
              {policy?.allow_deletion ? 'Enabled' : 'Disabled'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {policy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Policy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">
                {new Date(policy.updated_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated By:</span>
              <span className="text-gray-900">
                {policy.updated_by === user?.id ? 'You' : policy.updated_by}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
