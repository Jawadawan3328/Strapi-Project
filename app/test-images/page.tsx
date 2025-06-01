"use client"

import { useState, useEffect } from "react"

export default function TestImagesPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Test different image URLs to identify the issue
  const testUrls = [
    // Direct Strapi media URL
    "https://devoted-desk-a04040503d.media.strapiapp.com/small_pic1_1fdc3bdf1c.webp",

    // Alternative formats
    "https://devoted-desk-a04040503d.media.strapiapp.com/pic1_1fdc3bdf1c.webp",

    // Test if main domain works
    "https://devoted-desk-a04040503d.strapiapp.com/uploads/small_pic1_1fdc3bdf1c.webp",

    // Test external image (should work)
    "https://via.placeholder.com/300x300/cccccc/666666?text=Test+Image",

    // Test local placeholder
    "/placeholder.svg?height=300&width=300",
  ]

  useEffect(() => {
    const testImages = async () => {
      const results = []

      for (const url of testUrls) {
        try {
          console.log(`🧪 Testing image URL: ${url}`)

          // Test with fetch first
          const fetchResult = await fetch(url, {
            method: "HEAD",
            mode: "no-cors", // This bypasses CORS for testing
          })
            .then(() => "fetch-success")
            .catch((err) => `fetch-error: ${err.message}`)

          // Test with Image object
          const imageTest = await new Promise((resolve) => {
            const img = new Image()
            img.crossOrigin = "anonymous" // Try to handle CORS
            img.onload = () => resolve("image-success")
            img.onerror = (err) => resolve(`image-error: ${err}`)
            img.src = url

            // Timeout after 5 seconds
            setTimeout(() => resolve("timeout"), 5000)
          })

          results.push({
            url,
            fetchResult,
            imageTest,
            status: imageTest === "image-success" ? "success" : "failed",
          })
        } catch (error) {
          results.push({
            url,
            fetchResult: "error",
            imageTest: "error",
            status: "failed",
            error: String(error),
          })
        }
      }

      setTestResults(results)
      setLoading(false)
    }

    testImages()
  }, [])

  const testStrapiAPI = async () => {
    try {
      console.log("🔍 Testing Strapi API directly...")

      const response = await fetch("/api/test-strapi-media")
      const data = await response.json()

      console.log("📊 Strapi API test result:", data)
      alert(`Strapi API Test: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error("❌ Strapi API test failed:", error)
      alert(`Strapi API Test Failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Image Loading Test</h1>

      <div className="mb-6">
        <button onClick={testStrapiAPI} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Test Strapi API
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg">Testing image URLs...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-4"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {testResults.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Test {index + 1}</h3>

              <div className="mb-4">
                <p className="text-sm font-medium mb-1">URL:</p>
                <p className="text-xs text-gray-600 break-all mb-2">{result.url}</p>

                <div className="flex gap-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded ${result.fetchResult.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    Fetch: {result.fetchResult}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${result.imageTest.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    Image: {result.imageTest}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Standard img tag test */}
                <div>
                  <p className="text-sm font-medium mb-2">Standard img tag:</p>
                  <div className="aspect-square bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <img
                      src={result.url || "/placeholder.svg"}
                      alt={`Test ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                      onLoad={() => console.log(`✅ Standard img loaded: ${result.url}`)}
                      onError={(e) => {
                        console.error(`❌ Standard img failed: ${result.url}`)
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                    <div className="hidden text-center text-red-500">
                      <div className="text-2xl mb-1">❌</div>
                      <div className="text-xs">Failed to load</div>
                    </div>
                  </div>
                </div>

                {/* Background image test */}
                <div>
                  <p className="text-sm font-medium mb-2">Background image:</p>
                  <div
                    className="aspect-square bg-gray-200 border-2 border-dashed border-gray-300 bg-cover bg-center"
                    style={{ backgroundImage: `url(${result.url})` }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-white text-xs">
                      Background Test
                    </div>
                  </div>
                </div>
              </div>

              {result.error && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 text-xs rounded">Error: {result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">Troubleshooting Steps:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Check if external images (placeholder) work - this tests your browser</li>
          <li>2. Check if Strapi media URLs are accessible - this tests Strapi configuration</li>
          <li>3. Look for CORS errors in browser console (F12)</li>
          <li>4. Verify Strapi media settings allow public access</li>
          <li>5. Check if your Strapi media domain is correct</li>
        </ul>
      </div>
    </div>
  )
}
