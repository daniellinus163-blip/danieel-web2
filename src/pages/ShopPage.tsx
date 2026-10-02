import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, ShoppingBag, Search, Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
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
}

export default function ShopPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
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
      setProducts(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    
    const price = product.sale_price || product.price
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1]

    return matchesSearch && matchesCategory && matchesPrice
  })

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
            <h1 className="text-xl font-bold text-gray-900">Shop</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Shop</h2>
          <p className="text-gray-600 mt-2">Discover our collection of premium fashion</p>
        </div>
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      !selectedCategory ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md ${
                        selectedCategory === category.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600">${priceRange[0]} - ${priceRange[1]}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6 p-4 border border-gray-200 rounded-lg space-y-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{filteredProducts.length} products</p>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
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
      </div>
    </div>
  )
}
