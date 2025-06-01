import { getProducts } from "@/lib/strapi"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"

export default async function HomePage() {
  console.log("🏠 Loading home page...")

  try {
    const products = await getProducts()
    console.log("📊 Products count:", products.length)

    return (
      <div className="min-h-screen bg-gray-50">
        <ProductFilters productCount={products.length} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Featured Products</h1>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found.</p>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm text-yellow-700 mb-2">Possible reasons:</p>
                <ul className="text-sm text-yellow-600 list-disc list-inside space-y-1">
                  <li>No products created in Strapi yet</li>
                  <li>Products exist but aren't published</li>
                  <li>API token doesn't have permission to access products</li>
                </ul>
              </div>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("❌ Error in home page:", error)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-700 mb-4">There was an error loading products from Strapi.</p>
              <div className="text-sm text-red-600">
                <p className="font-medium mb-2">Troubleshooting steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check if your Strapi server is running</li>
                  <li>Verify your API token is correct and has proper permissions</li>
                  <li>Make sure your Strapi URL is correct</li>
                  <li>Check if your products are published in Strapi</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
