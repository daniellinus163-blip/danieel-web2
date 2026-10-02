import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sale_price: number | null
  category_id: string | null
  collection_id: string | null
  is_active: boolean
  is_featured: boolean
  sku: string
  stock_quantity: number
  product_images: Array<{
    image_url: string
    alt_text: string
    is_primary: boolean
  }>
}

type Category = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchCategory(slug)
      fetchProducts(slug)
    }
  }, [slug])

  const fetchCategory = async (categorySlug: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single()

      if (error) throw error
      setCategory(data)
    } catch (error: any) {
      console.error('Failed to fetch category:', error)
    }
  }

  const fetchProducts = async (categorySlug: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text, is_primary)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter products by category slug
      const filteredProducts = (data || []).filter(product => {
        // Get category for this product
        const productCategory = category
        return product.category_id === category?.id
      })

      setProducts(filteredProducts)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
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

  const addToWishlist = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add items to wishlist')
      return
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        })

      if (error) throw error
      toast.success('Added to wishlist')
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Already in wishlist')
      } else {
        toast.error(error.message || 'Failed to add to wishlist')
      }
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
            <h1 className="text-xl font-bold text-gray-900">{category?.name}</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {category && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage = product.product_images.find(img => img.is_primary) || product.product_images[0]
              const price = product.sale_price || product.price
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${product.slug}`}>
                    <div className="aspect-[3/4] bg-gray-200 relative">
                      {primaryImage && (
                        <img
                          src={primaryImage.image_url}
                          alt={primaryImage.alt_text || product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {product.sale_price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Sale
                        </span>
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
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToWishlist(product.id)}
                      >
                        <Heart className="h-4 w-4" />
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
