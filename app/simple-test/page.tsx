"use client"

import { useState } from "react"

export default function SimpleTestPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      console.log("🔍 Starting simple Strapi test...")

      // Test 1: Basic fetch to Strapi
      const response = await fetch(
        "https://devoted-desk-a04040503d.strapiapp.com/api/products?populate=*&pagination[limit]=1",
        {
          headers: {
            Authorization:
              "Bearer 2b0bbc326565e0b607ac680fd1c2a46ee65ae9184638c3c15f641a839d1fbaf37a3759ed9e92c4d70473fa07a2c5e988716f42201fd5a35945e745d0a61a697f1b4d7bb0cf11d4685450aa3b8074e9babec9e928c659e93bece46947bc2139bf625ad9730cc0d53505cdd475b9cdaff227ade428a680346a2d269296ae5a29f7",
            "Content-Type": "application/json",
          },
        },
      )

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Raw Strapi data:", data)

      // Extract first product
      const firstProduct = data.data?.[0]
      if (!firstProduct) {
        setTestResult({ error: "No products found in Strapi" })
        return
      }

      const attrs = firstProduct.attributes || {}
      console.log("📊 First product attributes:", attrs)

      // Try to find image data
      let imageInfo = null
      if (attrs.Image) {
        console.log("🖼️ Image field found:", attrs.Image)
        imageInfo = attrs.Image
      }

      setTestResult({
        success: true,
        productCount: data.data.length,
        firstProduct: {
          id: firstProduct.id,
          title: attrs.title || attrs.name || "No title",
          price: attrs.Price || attrs.price || 0,
          imageField: imageInfo,
        },
        rawData: data,
      })
    } catch (error) {
      console.error("❌ Test failed:", error)
      setTestResult({
        error: String(error),
        message: "Failed to connect to Strapi. Check console for details.",
      })
    } finally {
      setLoading(false)
    }
  }

  const testDirectImageAccess = async () => {
    const testUrls = [
      "https://devoted-desk-a04040503d.media.strapiapp.com/small_pic1_1fdc3bdf1c.webp",
      "https://devoted-desk-a04040503d.strapiapp.com/uploads/small_pic1_1fdc3bdf1c.webp",
      "https://devoted-desk-a04040503d.strapiapp.com/small_pic1_1fdc3bdf1c.webp",
    ]

    console.log("🧪 Testing direct image access...")

    for (const url of testUrls) {
      try {
        const response = await fetch(url, { method: "HEAD" })
        console.log(`📸 ${url} - Status: ${response.status}`)

        if (response.ok) {
          console.log(`✅ Image accessible: ${url}`)
          alert(`✅ Found working image URL: ${url}`)
          return
        }
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error}`)
      }
    }

    alert("❌ No image URLs are accessible")
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Simple Strapi Test</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Strapi Connection"}
        </button>

        <button
          onClick={testDirectImageAccess}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 ml-4"
        >
          Test Direct Image Access
        </button>
      </div>

      {testResult && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>

          {testResult.error ? (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
              <h3 className="font-medium">Error:</h3>
              <p>{testResult.error}</p>
              {testResult.message && <p className="mt-2">{testResult.message}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded">
                <h3 className="font-medium">✅ Strapi Connection Successful!</h3>
                <p>Found {testResult.productCount} product(s)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h3 className="font-medium mb-2">First Product:</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>ID:</strong> {testResult.firstProduct.id}
                  </li>
                  <li>
                    <strong>Title:</strong> {testResult.firstProduct.title}
                  </li>
                  <li>
                    <strong>Price:</strong> Rs.{testResult.firstProduct.price}
                  </li>
                  <li>
                    <strong>Has Image Field:</strong> {testResult.firstProduct.imageField ? "Yes" : "No"}
                  </li>
                </ul>
              </div>

              {testResult.firstProduct.imageField && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <h3 className="font-medium mb-2">Image Field Data:</h3>
                  <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(testResult.firstProduct.imageField, null, 2)}
                  </pre>
                </div>
              )}

              <details className="bg-gray-100 border p-4 rounded">
                <summary className="font-medium cursor-pointer">Raw Strapi Response (Click to expand)</summary>
                <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-60">
                  {JSON.stringify(testResult.rawData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">Next Steps:</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>First, test the Strapi connection to see if we can get product data</li>
          <li>Check if the Image field exists and has data</li>
          <li>Test direct image access to see if media files are publicly available</li>
          <li>Based on results, we'll fix the image URLs in the main app</li>
        </ol>
      </div>

      {/* Simple image test area */}
      <div className="mt-8 border-t pt-8">
        <h2 className="text-lg font-semibold mb-4">Direct Image Test</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Test Image 1:</p>
            <img
              src="https://devoted-desk-a04040503d.media.strapiapp.com/small_pic1_1fdc3bdf1c.webp"
              alt="Test 1"
              className="w-full h-32 object-cover border"
              onLoad={() => console.log("✅ Test image 1 loaded")}
              onError={(e) => {
                console.log("❌ Test image 1 failed")
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
            <div className="hidden bg-red-100 w-full h-32 flex items-center justify-center border">
              <span className="text-red-600 text-sm">Failed to load</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">External Test (should work):</p>
            <img
              src="https://via.placeholder.com/300x200/cccccc/666666?text=External+Test"
              alt="External test"
              className="w-full h-32 object-cover border"
              onLoad={() => console.log("✅ External test image loaded")}
              onError={() => console.log("❌ External test image failed")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
