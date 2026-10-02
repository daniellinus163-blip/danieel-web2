import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

type WishlistItem = {
  id: string
  product_id: string
  created_at: string
  products: {
    name: string
    slug: string
    price: number
    sale_price: number | null
    product_images: Array<{
      image_url: string
      alt_text: string
      is_primary: boolean
    }>
  }
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlistItems()
  }, [])

  const fetchWishlistItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products(name, slug, price, sale_price, product_images(image_url, alt_text, is_primary))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishlistItems(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      await fetchWishlistItems()
      toast.success('Removed from wishlist')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item')
    }
  }

  const addToCart = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add items to cart')
      return
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        })

      if (error) throw error
      toast.success('Added to cart')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart')
    }
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
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Your wishlist is empty</p>
            <Link to="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.products
              const price = product.sale_price || product.price
              const primaryImage = product.product_images.find(img => img.is_primary) || product.product_images[0]

              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${product.slug}`}>
                    <div className="aspect-[3/4] bg-gray-200 relative">
                      {primaryImage && (
                        <img
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      {product.sale_price ? (
                        <>
                          <p className="text-lg font-bold text-gray-900">${product.sale_price}</p>
                          <p className="text-sm text-gray-500 line-through">${product.price}</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">${product.price}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-black text-white hover:bg-gray-800"
                        onClick={() => addToCart(item.product_id)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
