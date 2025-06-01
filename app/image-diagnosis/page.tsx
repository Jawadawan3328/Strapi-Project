"use client"

import { useState, useEffect } from "react"

export default function ImageDiagnosisPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runFullDiagnosis = async () => {
    setLoading(true)
    const diagnosticResults: any = {
      step1: null,
      step2: null,
      step3: null,
      step4: null,
      step5: null,
    }

    try {
      // Step 1: Test external image (should always work)
      console.log("🧪 Step 1: Testing external image...")
      const externalImageTest = await testImageLoad(
        "https://via.placeholder.com/300x300/0066cc/ffffff?text=External+Test",
      )
      diagnosticResults.step1 = {
        name: "External Image Test",
        url: "https://via.placeholder.com/300x300/0066cc/ffffff?text=External+Test",
        result: externalImageTest,
        expected: "Should work - tests if your browser can load images at all",
      }

      // Step 2: Test Strapi API connection
      console.log("🧪 Step 2: Testing Strapi API...")
      try {
        const apiResponse = await fetch("/api/strapi-test")
        const apiData = await apiResponse.json()
        diagnosticResults.step2 = {
          name: "Strapi API Connection",
          result: apiData.success ? "success" : "failed",
          data: apiData,
          expected: "Should return product data from Strapi",
        }
      } catch (apiError) {
        diagnosticResults.step2 = {
          name: "Strapi API Connection",
          result: "failed",
          error: String(apiError),
          expected: "Should return product data from Strapi",
        }
      }

      // Step 3: Test known Strapi media URLs
      console.log("🧪 Step 3: Testing known Strapi media URLs...")
      const strapiUrls = [
        "https://devoted-desk-a04040503d.media.strapiapp.com/small_pic1_1fdc3bdf1c.webp",
        "https://devoted-desk-a04040503d.strapiapp.com/uploads/small_pic1_1fdc3bdf1c.webp",
        "https://devoted-desk-a04040503d.media.strapiapp.com/pic1_1fdc3bdf1c.webp",
      ]

      const strapiImageTests = []
      for (const url of strapiUrls) {
        const result = await testImageLoad(url)
        strapiImageTests.push({ url, result })
      }

      diagnosticResults.step3 = {
        name: "Known Strapi Media URLs",
        tests: strapiImageTests,
        expected: "At least one should work if Strapi media is accessible",
      }

      // Step 4: Test CORS and fetch access
      console.log("🧪 Step 4: Testing CORS and fetch access...")
      const corsTests = []
      for (const url of strapiUrls) {
        try {
          const response = await fetch(url, { method: "HEAD", mode: "no-cors" })
          corsTests.push({ url, result: "fetch-success", status: "no-cors-mode" })
        } catch (error) {
          corsTests.push({ url, result: "fetch-failed", error: String(error) })
        }
      }

      diagnosticResults.step4 = {
        name: "CORS and Fetch Test",
        tests: corsTests,
        expected: "Should be able to fetch media files",
      }

      // Step 5: Test if we can get actual product images from API
      console.log("🧪 Step 5: Testing actual product images from API...")
      try {
        const productResponse = await fetch("/api/get-product-images")
        const productData = await productResponse.json()

        if (productData.success && productData.imageUrls.length > 0) {
          const productImageTests = []
          for (const url of productData.imageUrls.slice(0, 3)) {
            const result = await testImageLoad(url)
            productImageTests.push({ url, result })
          }

          diagnosticResults.step5 = {
            name: "Actual Product Images",
            tests: productImageTests,
            imageUrls: productData.imageUrls,
            expected: "Product images should load if properly configured",
          }
        } else {
          diagnosticResults.step5 = {
            name: "Actual Product Images",
            result: "no-images-found",
            data: productData,
            expected: "Should find image URLs in products",
          }
        }
      } catch (error) {
        diagnosticResults.step5 = {
          name: "Actual Product Images",
          result: "api-error",
          error: String(error),
          expected: "Should be able to get product images from API",
        }
      }

      setResults(diagnosticResults)
    } catch (error) {
      console.error("❌ Diagnosis failed:", error)
      setResults({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testImageLoad = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve("success")
      img.onerror = () => resolve("failed")
      img.src = url

      // Timeout after 10 seconds
      setTimeout(() => resolve("timeout"), 10000)
    })
  }

  useEffect(() => {
    // Auto-run diagnosis when page loads
    runFullDiagnosis()
  }, [])

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Complete Image Diagnosis</h1>

      <div className="mb-6">
        <button
          onClick={runFullDiagnosis}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Running Diagnosis..." : "Run Full Diagnosis"}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Running comprehensive image diagnosis...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          {results.error ? (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded">
              <h3 className="font-medium">Diagnosis Failed</h3>
              <p>{results.error}</p>
            </div>
          ) : (
            <>
              {/* Step 1: External Image Test */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  Step 1: {results.step1?.name}{" "}
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded ${
                      results.step1?.result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.step1?.result}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mb-2">{results.step1?.expected}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Test Image:</p>
                    <img
                      src={results.step1?.url || "/placeholder.svg"}
                      alt="External test"
                      className="w-full h-32 object-cover border"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Result:</p>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      {results.step1?.result === "success" ? (
                        <span className="text-green-600">✅ External images work fine</span>
                      ) : (
                        <span className="text-red-600">❌ Browser cannot load images</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Strapi API */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  Step 2: {results.step2?.name}{" "}
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded ${
                      results.step2?.result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {results.step2?.result}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mb-2">{results.step2?.expected}</p>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  <pre>{JSON.stringify(results.step2?.data || results.step2?.error, null, 2)}</pre>
                </div>
              </div>

              {/* Step 3: Known Strapi URLs */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Step 3: {results.step3?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{results.step3?.expected}</p>
                <div className="space-y-2">
                  {results.step3?.tests?.map((test: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-xs break-all">{test.url}</div>
                      <div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            test.result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {test.result}
                        </span>
                      </div>
                      <div>
                        <img
                          src={test.url || "/placeholder.svg"}
                          alt={`Test ${index}`}
                          className="w-16 h-16 object-cover border"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: CORS Test */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Step 4: {results.step4?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{results.step4?.expected}</p>
                <div className="space-y-1">
                  {results.step4?.tests?.map((test: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-xs break-all flex-1">{test.url}</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded ${
                          test.result === "fetch-success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {test.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 5: Actual Product Images */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Step 5: {results.step5?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{results.step5?.expected}</p>
                {results.step5?.tests ? (
                  <div className="space-y-2">
                    {results.step5.tests.map((test: any, index: number) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-xs break-all">{test.url}</div>
                        <div>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              test.result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {test.result}
                          </span>
                        </div>
                        <div>
                          <img
                            src={test.url || "/placeholder.svg"}
                            alt={`Product ${index}`}
                            className="w-16 h-16 object-cover border"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <pre>{JSON.stringify(results.step5?.data || results.step5?.error, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Recommendations Based on Results:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  {results.step1?.result !== "success" && (
                    <li>• Your browser has issues loading images - check internet connection</li>
                  )}
                  {results.step2?.result !== "success" && <li>• Fix Strapi API connection first</li>}
                  {results.step3?.tests?.every((t: any) => t.result !== "success") && (
                    <li>• Strapi media files are not publicly accessible - check Strapi media settings</li>
                  )}
                  {results.step4?.tests?.every((t: any) => t.result !== "fetch-success") && (
                    <li>• CORS issues - configure Strapi to allow cross-origin requests</li>
                  )}
                  {results.step5?.result === "no-images-found" && (
                    <li>• No images found in products - add images to your Strapi products</li>
                  )}
                  <li>• Check browser console (F12) for detailed error messages</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
