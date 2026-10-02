import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Share2, Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

type Post = {
  id: string
  user_id: string
  caption: string
  image_url: string | null
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
  reactions: Array<{ id: string }>
  comments: Array<{ id: string }>
}

export default function CommunityPage() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostCaption, setNewPostCaption] = useState('')
  const [newPostImage, setNewPostImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          reactions(id),
          comments(id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch profile information for each post author
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', post.user_id)
            .single()

          return {
            ...post,
            profiles: profileData || { full_name: 'Unknown', avatar_url: null, role: 'member' }
          }
        })
      )

      setPosts(postsWithProfiles)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!newPostCaption.trim() && !newPostImage) {
      toast.error('Please add a caption or image')
      return
    }

    setUploading(true)
    try {
      let imageUrl = null

      if (newPostImage) {
        const fileExt = newPostImage.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, newPostImage)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          caption: newPostCaption,
          image_url: imageUrl,
        })

      if (error) throw error

      toast.success('Post created successfully!')
      setNewPostCaption('')
      setNewPostImage(null)
      setShowCreatePost(false)
      await fetchPosts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post')
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to like posts')
      return
    }

    try {
      const { error } = await supabase
        .from('reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: 'like',
        })

      if (error) {
        // If already liked, remove the like
        if (error.code === '23505') {
          await supabase
            .from('reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
        } else {
          throw error
        }
      }

      await fetchPosts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to like post')
    }
  }

  const canViewProfile = (postRole: string) => {
    if (!profile) return false
    if (profile.role === 'super_admin') return true
    if (profile.role === 'admin' && postRole !== 'super_admin') return true
    if (profile.role === 'member' && postRole === 'member') return true
    return false
  }

  const getAuthorDisplay = (postAuthor: any) => {
    if (!profile) {
      return { name: 'Anonymous', role: 'Member', avatar: null }
    }
    
    if (profile.role === 'super_admin') {
      return {
        name: postAuthor.full_name,
        role: postAuthor.role,
        avatar: postAuthor.avatar_url
      }
    }
    
    if (profile.role === 'admin') {
      if (postAuthor.role === 'super_admin') {
        return { name: 'Anonymous', role: 'Member', avatar: null }
      }
      return {
        name: postAuthor.full_name,
        role: postAuthor.role,
        avatar: postAuthor.avatar_url
      }
    }
    
    if (profile.role === 'member') {
      if (postAuthor.role === 'member') {
        return {
          name: postAuthor.full_name,
          role: postAuthor.role,
          avatar: postAuthor.avatar_url
        }
      }
      return { name: 'Anonymous', role: 'Member', avatar: null }
    }
    
    return { name: 'Anonymous', role: 'Member', avatar: null }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              {profile && (
                <Button onClick={() => setShowCreatePost(!showCreatePost)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Post Form */}
        {showCreatePost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <Input
                    value={newPostCaption}
                    onChange={(e) => setNewPostCaption(e.target.value)}
                    placeholder="What's on your mind?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Posting...' : 'Post'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No posts yet</p>
            {profile && (
              <Button onClick={() => setShowCreatePost(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const postAuthor = post.profiles
              const authorDisplay = getAuthorDisplay(postAuthor)

              return (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                          {authorDisplay.avatar ? (
                            <img
                              src={authorDisplay.avatar}
                              alt={authorDisplay.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            authorDisplay.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{authorDisplay.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{authorDisplay.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Post Content */}
                    {post.image_url && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="w-full object-cover max-h-96"
                        />
                      </div>
                    )}
                    {post.caption && (
                      <p className="text-gray-900 mb-4">{post.caption}</p>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center space-x-6 border-t border-gray-200 pt-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-black"
                      >
                        <Heart className="h-5 w-5" />
                        <span>{post.reactions.length}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-black">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments.length}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-black">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Delete button for own posts */}
                    {user && post.user_id === user.id && (
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('community_posts')
                              .delete()
                              .eq('id', post.id)

                            if (error) throw error
                            toast.success('Post deleted')
                            await fetchPosts()
                          } catch (error: any) {
                            toast.error(error.message || 'Failed to delete post')
                          }
                        }}
                        className="mt-4 text-sm text-red-600 hover:text-red-700"
                      >
                        Delete Post
                      </button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
