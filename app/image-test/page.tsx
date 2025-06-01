"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// Strapi configuration
const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "4465ed8a35477d62adeec209ee300bb0524dccff957cecdcfa60089c29dcf243d0529f0e4f44f0ab156c63898cd7452b06501e403de6544ab0d02c049815a102d84c80e1f7b982f685f35b5e27573fe8dadccc6eef5f4481292e7a8e785f068a18dfb783ffe842530ed40d80fdf8d1cdac34a575df90b2e551145bb93628a9b3"

export default function ImageTestPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productData, setProductData] = useState<any>(null)
  const [imageTests, setImageTests] = useState<any[]>([])

  useEffect(() => {
    fetchProductData()
  }, [])

  async function fetchProductData() {
    setLoading(true)
    setError(null)

    try {
      // Fetch a single product with all relations
      const response = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[limit]=1`, {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setProductData(data)

      // Extract image data for testing
      if (data.data && data.data.length > 0) {
        const product = data.data[0]
        const attrs = product.attributes || {}

        console.log("Product attributes:", attrs)

        // Test different image access patterns
        const tests = []

        // Test 1: Check if Image field exists
        if (attrs.Image) {
          tests.push({
            name: "Image field exists",
            result: "success",
            details: `Type: ${typeof attrs.Image}, Is Array: ${Array.isArray(attrs.Image)}`,
          })

          // Test 2: Check if Image.data exists
          if (attrs.Image.data) {
            tests.push({
              name: "Image.data exists",
              result: "success",
              details: `Type: ${typeof attrs.Image.data}, Is Array: ${Array.isArray(attrs.Image.data)}`,
            })

            // Test 3: Extract URL based on structure
            const imageData = attrs.Image.data
            let imageUrl = null

            if (Array.isArray(imageData)) {
              if (imageData.length > 0 && imageData[0].attributes?.url) {
                imageUrl = imageData[0].attributes.url
                tests.push({
                  name: "Image URL from array",
                  result: "success",
                  url: imageUrl,
                  details: `Found URL in array[0].attributes.url`,
                })
              } else {
                tests.push({
                  name: "Image URL from array",
                  result: "failed",
                  details: `Array exists but no URL found in array[0].attributes.url`,
                })
              }
            } else if (imageData.attributes?.url) {
              imageUrl = imageData.attributes.url
              tests.push({
                name: "Image URL from object",
                result: "success",
                url: imageUrl,
                details: `Found URL in data.attributes.url`,
              })
            } else {
              tests.push({
                name: "Image URL extraction",
                result: "failed",
                details: `Could not find URL in expected locations`,
              })
            }

            // Test 4: Test different URL formats
            if (imageUrl) {
              // Test direct URL
              tests.push({
                name: "Direct URL",
                result: "pending",
                url: imageUrl,
                details: `Testing direct URL from API`,
              })

              // Test with STRAPI_URL prefix
              if (!imageUrl.startsWith("http")) {
                const fullUrl = `${STRAPI_URL}${imageUrl}`
                tests.push({
                  name: "Full URL with prefix",
                  result: "pending",
                  url: fullUrl,
                  details: `Testing with STRAPI_URL prefix`,
                })
              }

              // Test with media subdomain
              if (imageUrl.startsWith("/uploads/")) {
                const mediaUrl = `https://devoted-desk-a04040503d.media.strapiapp.com${imageUrl}`
                tests.push({
                  name: "Media subdomain URL",
                  result: "pending",
                  url: mediaUrl,
                  details: `Testing with media subdomain`,
                })
              }
            }
          } else {
            tests.push({
              name: "Image.data check",
              result: "failed",
              details: `Image field exists but no data property found`,
            })
          }
        } else {
          tests.push({
            name: "Image field check",
            result: "failed",
            details: `No Image field found in product attributes`,
          })
        }

        setImageTests(tests)
      } else {
        setError("No products found in API response")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Function to test if an image URL loads
  const testImageUrl = async (url: string, index: number) => {
    const updatedTests = [...imageTests]

    try {
      const img = new Image()
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve("success")
        img.onerror = () => reject(new Error("Failed to load"))
        setTimeout(() => reject(new Error("Timeout")), 5000)
      })

      img.src = url
      await loadPromise

      updatedTests[index] = {
        ...updatedTests[index],
        result: "success",
        details: `${updatedTests[index].details} - Image loaded successfully`,
      }
    } catch (err) {
      updatedTests[index] = {
        ...updatedTests[index],
        result: "failed",
        details: `${updatedTests[index].details} - ${err instanceof Error ? err.message : "Unknown error"}`,
      }
    }

    setImageTests(updatedTests)
  }

  const testAllUrls = () => {
    imageTests.forEach((test, index) => {
      if (test.url && test.result === "pending") {
        testImageUrl(test.url, index)
      }
    })
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Strapi Image Diagnostic</h1>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading product data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchProductData} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Test Results */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Image Tests</h2>

            <div className="mb-4">
              <Button onClick={testAllUrls}>Test All Image URLs</Button>
            </div>

            <div className="space-y-4">
              {imageTests.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    test.result === "success"
                      ? "bg-green-50 border-green-200"
                      : test.result === "failed"
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <h3 className="font-medium mb-2">{test.name}</h3>
                  <p className="text-sm mb-2">{test.details}</p>

                  {test.url && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1 break-all">{test.url}</p>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xs font-medium mb-1">Image Preview:</p>
                          <div className="aspect-square bg-gray-100 border flex items-center justify-center">
                            <img
                              src={test.url || "/placeholder.svg"}
                              alt="Test"
                              className="max-w-full max-h-full object-contain"
                              onLoad={() => console.log(`Image loaded: ${test.url}`)}
                              onError={() => console.log(`Image failed: ${test.url}`)}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium mb-1">Background Image Test:</p>
                          <div
                            className="aspect-square bg-gray-100 border bg-center bg-no-repeat bg-contain"
                            style={{ backgroundImage: `url(${test.url})` }}
                          ></div>
                        </div>
                      </div>

                      {test.result === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => testImageUrl(test.url, index)}
                        >
                          Test This URL
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw API Response */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-2">Raw API Response</h2>
            <div className="bg-white p-4 rounded border overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(productData, null, 2)}</pre>
            </div>
          </div>

          {/* Troubleshooting Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Troubleshooting Guide</h2>
            <div className="text-sm text-blue-700 space-y-2">
              <p className="font-medium">If images aren't loading, check:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Strapi Media Library permissions (should be public)</li>
                <li>Image URLs in the API response (check the raw response above)</li>
                <li>CORS settings in Strapi (allow your frontend domain)</li>
                <li>Media provider settings in Strapi</li>
                <li>If using Cloudinary or other providers, check their configuration</li>
              </ol>

              <p className="font-medium mt-4">Common solutions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure images are uploaded and published in Strapi</li>
                <li>Check if the media files are accessible directly via URL</li>
                <li>Verify your Strapi token has permission to access media</li>
                <li>Try using the full absolute URL with your Strapi domain</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
