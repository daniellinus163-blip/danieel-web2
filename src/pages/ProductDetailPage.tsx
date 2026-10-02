import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Heart, ShoppingBag, Share2, Minus, Plus, Truck, Shield, RefreshCw, ArrowLeft } from 'lucide-react'
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
  created_at: string
  product_images: Array<{
    id: string
    image_url: string
    alt_text: string
    is_primary: boolean
    display_order: number
  }>
  product_sizes: Array<{
    id: string
    size: string
    stock_quantity: number
  }>
  product_colors: Array<{
    id: string
    color_name: string
    color_code: string
    stock_quantity: number
  }>
  categories: {
    name: string
    slug: string
  } | null
  collections: {
    name: string
    slug: string
  } | null
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (slug) {
      fetchProduct(slug)
    }
  }, [slug])

  const fetchProduct = async (productSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_sizes(*),
          product_colors(*),
          categories(name, slug),
          collections(name, slug)
        `)
        .eq('slug', productSlug)
        .eq('is_active', true)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add items to cart')
      return
    }

    if (!product) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        })

      if (error) throw error
      toast.success('Added to cart')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart')
    }
  }

  const addToWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add items to wishlist')
      return
    }

    if (!product) return

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: product.id,
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

  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Product not found</p>
      </div>
    )
  }

  const images = product.product_images.sort((a, b) => a.display_order - b.display_order)
  const currentImage = images[selectedImage] || images[0]
  const price = product.sale_price || product.price

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
            <h1 className="text-xl font-bold text-gray-900">Product Details</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-black">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImage && (
                <img
                  src={currentImage.image_url}
                  alt={currentImage.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.categories && (
                <Link to={`/categories/${product.categories.slug}`} className="text-sm text-purple-600 hover:text-purple-700">
                  {product.categories.name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              {product.sale_price ? (
                <>
                  <p className="text-3xl font-bold text-gray-900">${product.sale_price}</p>
                  <p className="text-xl text-gray-500 line-through">${product.price}</p>
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                    {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <p className="text-3xl font-bold text-gray-900">${product.price}</p>
              )}
            </div>

            {/* Size Selection */}
            {product.product_sizes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex gap-2">
                  {product.product_sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.size)}
                      disabled={size.stock_quantity === 0}
                      className={`px-4 py-2 border rounded-md ${
                        selectedSize === size.size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      } ${size.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.product_colors.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.product_colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.color_name)}
                      disabled={color.stock_quantity === 0}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor === color.color_name
                          ? 'border-black ring-2 ring-offset-2 ring-black'
                          : 'border-gray-300'
                      } ${color.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: color.color_code }}
                      title={color.color_name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {product.stock_quantity} in stock
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-black text-white hover:bg-gray-800"
                onClick={addToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={addToWishlist}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Info */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">Your payment information is safe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SKU */}
            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
