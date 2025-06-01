import { testStrapiConnection, getFirstProductWithImage } from "@/lib/strapi-simple"

export default async function WorkingTestPage() {
  // Test basic connection
  const connectionTest = await testStrapiConnection()

  // Test getting product with image
  const productTest = await getFirstProductWithImage()

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Working Test Results</h1>

      {/* Connection Test Results */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Basic Connection Test</h2>
        <div
          className={`p-4 rounded-lg border ${connectionTest.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          {connectionTest.success ? (
            <div>
              <p className="text-green-700 font-medium">✅ Connection Successful</p>
              <p className="text-green-600 text-sm">
                Found {connectionTest.productCount} total products
                {connectionTest.hasProducts ? " (has products)" : " (no products)"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-700 font-medium">❌ Connection Failed</p>
              <p className="text-red-600 text-sm">{connectionTest.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Test Results */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">2. Product with Image Test</h2>
        <div
          className={`p-4 rounded-lg border ${productTest.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          {productTest.success ? (
            <div className="space-y-4">
              <p className="text-green-700 font-medium">✅ Product Retrieved Successfully</p>

              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium mb-2">Product Details:</h3>
                <ul className="text-sm space-y-1">
                  <li>
                    <strong>ID:</strong> {productTest.product?.id}
                  </li>
                  <li>
                    <strong>Title:</strong> {productTest.product?.title}
                  </li>
                  <li>
                    <strong>Price:</strong> Rs.{productTest.product?.price}
                  </li>
                  <li>
                    <strong>Image URL:</strong>{" "}
                    {productTest.product?.imageUrl ? (
                      <span className="text-green-600">{productTest.product.imageUrl}</span>
                    ) : (
                      <span className="text-red-600">No image URL found</span>
                    )}
                  </li>
                </ul>
              </div>

              {productTest.product?.imageUrl && (
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-medium mb-2">Image Test:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-2">Direct Image Load:</p>
                      <div className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <img
                          src={productTest.product.imageUrl || "/placeholder.svg"}
                          alt={productTest.product.title}
                          className="max-w-full max-h-full object-contain"
                          onLoad={() => console.log("✅ Image loaded successfully")}
                          onError={(e) => {
                            console.error("❌ Image failed to load")
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                        <div className="hidden text-center text-red-500">
                          <div className="text-2xl mb-1">❌</div>
                          <div className="text-xs">Image failed to load</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm mb-2">Image Debug Info:</p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <pre>{JSON.stringify(productTest.product.imageDebugInfo, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <details className="bg-white p-4 rounded border">
                <summary className="font-medium cursor-pointer">Raw API Response (Click to expand)</summary>
                <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-60">
                  {JSON.stringify(productTest.rawData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div>
              <p className="text-red-700 font-medium">❌ Product Test Failed</p>
              <p className="text-red-600 text-sm">{productTest.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Next Steps Based on Results:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          {!connectionTest.success && <li>• Fix Strapi connection issues first</li>}
          {connectionTest.success && !connectionTest.hasProducts && <li>• Add some products to your Strapi</li>}
          {productTest.success && !productTest.product?.imageUrl && (
            <li>• Add images to your products in Strapi Media Library</li>
          )}
          {productTest.success && productTest.product?.imageUrl && (
            <li>• Check if the image loads above - if not, it's a media access issue</li>
          )}
          <li>• Check browser console (F12) for detailed error messages</li>
        </ul>
      </div>
    </div>
  )
}
