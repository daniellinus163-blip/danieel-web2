import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Shirt, ShoppingBag, Heart, Search, Menu, X, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Discover Your Style",
      subtitle: "Up to 70% OFF on Selected Items",
      description: "Explore our curated collection of premium fashion. From timeless classics to the latest trends.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
      bgColor: "from-purple-600 to-pink-500",
      buttonText: "Shop Now",
      secondaryButtonText: "Explore Community"
    },
    {
      title: "Summer Collection",
      subtitle: "Buy 1 Get 1 Free",
      description: "Fresh styles for the summer season. Limited time offer on all summer essentials.",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200",
      bgColor: "from-orange-500 to-red-500",
      buttonText: "Shop Collection",
      secondaryButtonText: "View Deals"
    },
    {
      title: "New Arrivals",
      subtitle: "Free Shipping on Orders $50+",
      description: "Be the first to get our latest fashion drops. Free delivery on all orders over $50.",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
      bgColor: "from-blue-600 to-cyan-500",
      buttonText: "Shop New Arrivals",
      secondaryButtonText: "See All"
    },
    {
      title: "Flash Sale",
      subtitle: "50% OFF Everything",
      description: "24-hour flash sale on all items. Don't miss out on these incredible deals!",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      bgColor: "from-green-500 to-teal-500",
      buttonText: "Shop Sale",
      secondaryButtonText: "Quick View"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Shirt className="h-8 w-8 text-black" />
                <span className="text-xl font-bold text-black">RoleSphere</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/shop" className="text-gray-700 hover:text-black transition-colors">Shop</Link>
              <Link to="/categories" className="text-gray-700 hover:text-black transition-colors">Categories</Link>
              <Link to="/collections" className="text-gray-700 hover:text-black transition-colors">Collections</Link>
              <Link to="/community" className="text-gray-700 hover:text-black transition-colors">Community</Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-700 hover:text-black transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <Link to="/wishlist">
                <button className="p-2 text-gray-700 hover:text-black transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/cart">
                <button className="p-2 text-gray-700 hover:text-black transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </Link>
              {user ? (
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link to="/shop" className="block text-gray-700 hover:text-black">Shop</Link>
              <Link to="/categories" className="block text-gray-700 hover:text-black">Categories</Link>
              <Link to="/collections" className="block text-gray-700 hover:text-black">Collections</Link>
              <Link to="/community" className="block text-gray-700 hover:text-black">Community</Link>
              <hr className="border-gray-200" />
              <Link to="/login" className="block text-gray-700 hover:text-black">Sign In</Link>
              <Link to="/signup" className="block text-gray-700 hover:text-black">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative h-[600px] md:h-[700px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <div className="inline-block bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
                      {slide.subtitle}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-white mb-8 drop-shadow-md">
                      {slide.description}
                    </p>
                    <div className="flex gap-4">
                      <Link to="/shop">
                        <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold">
                          {slide.buttonText}
                        </Button>
                      </Link>
                      <Link to="/community">
                        <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black font-bold">
                          {slide.secondaryButtonText}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Mens Fashion', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400', slug: 'mens-fashion' },
              { name: 'Womens Fashion', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', slug: 'womens-fashion' },
              { name: 'Streetwear', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400', slug: 'streetwear' },
              { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400', slug: 'accessories' },
            ].map((category) => (
              <Link key={category.name} to={`/categories/${category.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/shop" className="text-purple-600 hover:text-purple-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['mens-fashion', 'womens-fashion', 'streetwear', 'accessories'].map((slug, i) => (
              <Link key={slug} to={`/categories/${slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-[3/4] bg-gray-200">
                    <img
                      src={`https://images.unsplash.com/photo-${1521572163474 + i * 1000000}-6864f9cf17ab?w=400`}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Product Name</h3>
                    <p className="text-gray-600">$29.99</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center p-12">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Summer Collection 2024</h2>
                <p className="text-gray-300 mb-8">
                  Discover our exclusive summer collection featuring lightweight fabrics, vibrant colors, and timeless designs perfect for the season.
                </p>
                <Link to="/collections/summer-collection-2024">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                    Shop Collection
                  </Button>
                </Link>
              </div>
              <div className="aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"
                  alt="Summer Collection"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay in Style</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for exclusive offers, new arrivals, and fashion inspiration.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button className="bg-black text-white hover:bg-gray-800">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shirt className="h-8 w-8" />
                <span className="text-xl font-bold">RoleSphere</span>
              </div>
              <p className="text-gray-400">
                Your destination for premium fashion and style inspiration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/shop" className="hover:text-white">All Products</Link></li>
                <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
                <li><Link to="/collections" className="hover:text-white">Collections</Link></li>
                <li><Link to="/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQs</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Shipping</Link></li>
                <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/community" className="hover:text-white">Community</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RoleSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
