import { getProductsByCategory } from "@/lib/strapi"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"

export default async function KidsPage() {
  const products = await getProductsByCategory("kids")

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductFilters productCount={products.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Kids Collection</h1>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No kids products found.</p>
            <p className="text-gray-400 text-sm">
              Make sure you have:
              <br />• Created a category named "kids" in Strapi
              <br />• Assigned this category to some products
              <br />• Published both categories and products
            </p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
