import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProfileImageUpload() {
  const { user, profile, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }

      setUploading(true)

      // Check if upload is allowed
      const { data: policyCheck, error: policyError } = await supabase
        .rpc('check_image_policy', { operation: 'upload' })

      if (policyError || !policyCheck) {
        toast.error('Image uploads are currently disabled')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)

      if (updateError) {
        throw updateError
      }

      await refreshProfile()
      toast.success('Profile image updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleImageDelete = async () => {
    if (!user?.id) return

    try {
      setDeleting(true)

      // Check if deletion is allowed
      const { data: policyCheck, error: policyError } = await supabase
        .rpc('check_image_policy', { operation: 'delete' })

      if (policyError || !policyCheck) {
        toast.error('Image deletion is currently disabled')
        return
      }

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([`${user.id}/avatar`])

      if (deleteError && deleteError.message !== 'Object not found') {
        throw deleteError
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      await refreshProfile()
      toast.success('Profile image removed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative h-24 w-24 rounded-full bg-gray-200 overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-purple-100 text-purple-600">
              <span className="text-2xl font-bold">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </label>
          </div>

          {profile?.avatar_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImageDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  )
}
