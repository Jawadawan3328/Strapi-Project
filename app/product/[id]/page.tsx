import { getProductById, getProducts } from "@/lib/strapi"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log("🔍 Loading product page for ID:", params.id)

  try {
    const product = await getProductById(params.id)

    if (!product) {
      console.log("❌ Product not found, checking available products...")

      // Get all products to show available IDs for debugging
      const allProducts = await getProducts()
      console.log(
        "📊 Available product IDs:",
        allProducts.map((p) => ({ id: p.id, documentId: p.documentId, title: p.title })),
      )

      notFound()
    }

    console.log("✅ Product found:", product.title)

    const { title, description, price, image, imageAlt } = product

    // For demo purposes, let's add some random discount logic
    const hasDiscount = Math.random() > 0.5
    const discountPercentage = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0
    const originalPrice = hasDiscount ? Math.floor(price * 1.3) : undefined

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {image ? (
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={imageAlt || title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-4">📷</div>
                      <div className="text-lg">No Image Available</div>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-blue-600 text-white">New</Badge>
                  {discountPercentage > 0 && <Badge className="bg-red-600 text-white">-{discountPercentage}%</Badge>}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

                <div className="flex items-center gap-4 mb-6">
                  {originalPrice && (
                    <span className="text-xl text-gray-500 line-through">Rs.{originalPrice.toLocaleString()}.00</span>
                  )}
                  <span className="text-2xl font-bold text-gray-900">Rs.{price.toLocaleString()}.00</span>
                  {discountPercentage > 0 && (
                    <Badge className="bg-red-600 text-white">Save {discountPercentage}%</Badge>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                    <p className="text-red-800 text-sm font-medium">ONLINE EXCLUSIVE DISCOUNT</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {description ||
                    "Premium quality footwear designed for comfort and style. Perfect for everyday wear with superior craftsmanship and attention to detail."}
                </p>
              </div>

              {/* Categories */}
              {product.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[6, 7, 8, 9, 10, 11].map((size) => (
                      <Button key={size} variant="outline" className="h-12 text-sm">
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Free shipping on orders over Rs.2,000</p>
                  <p>• 30-day return policy</p>
                  <p>• Authentic Servis product</p>
                  <p>• Cash on delivery available</p>
                </div>
              </div>

              {/* Debug info */}
              <div className="border-t pt-6">
                <details className="text-sm text-gray-500">
                  <summary className="cursor-pointer font-medium">Debug Info</summary>
                  <div className="mt-2 space-y-1">
                    <p>Product ID: {product.id}</p>
                    <p>Document ID: {product.documentId}</p>
                    <p>Image URL: {product.image || "No image"}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("❌ Error in product page:", error)

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Product</h1>
            <p className="text-gray-600 mb-6">There was an error loading the product with ID: {params.id}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
