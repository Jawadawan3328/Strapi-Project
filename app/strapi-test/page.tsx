"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

// Your Strapi configuration
const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "4465ed8a35477d62adeec209ee300bb0524dccff957cecdcfa60089c29dcf243d0529f0e4f44f0ab156c63898cd7452b06501e403de6544ab0d02c049815a102d84c80e1f7b982f685f35b5e27573fe8dadccc6eef5f4481292e7a8e785f068a18dfb783ffe842530ed40d80fdf8d1cdac34a575df90b2e551145bb93628a9b3"

export default function StrapiTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const addResult = (test: string, status: "success" | "error", data: any) => {
    setResults((prev) => [...prev, { test, status, data, timestamp: new Date().toLocaleTimeString() }])
  }

  const clearResults = () => {
    setResults([])
  }

  const runBasicTests = async () => {
    setLoading(true)
    clearResults()

    // Test 1: Basic connectivity (no auth)
    try {
      addResult("Basic Connectivity", "success", "Starting basic connectivity test...")

      const response = await fetch(`${STRAPI_URL}/api`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.text()
        addResult("Basic Connectivity", "success", `Connected! Response: ${data.substring(0, 200)}`)
      } else {
        addResult("Basic Connectivity", "error", `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      addResult("Basic Connectivity", "error", `Network error: ${error}`)
    }

    // Test 2: Products endpoint without auth
    try {
      addResult("Products (No Auth)", "success", "Testing products endpoint without authentication...")

      const response = await fetch(`${STRAPI_URL}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        addResult("Products (No Auth)", "success", `Success! Found ${data.data?.length || 0} products`)
      } else {
        const errorText = await response.text()
        addResult("Products (No Auth)", "error", `HTTP ${response.status}: ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      addResult("Products (No Auth)", "error", `Error: ${error}`)
    }

    // Test 3: Products endpoint with auth
    try {
      addResult("Products (With Auth)", "success", "Testing products endpoint with authentication...")

      const response = await fetch(`${STRAPI_URL}/api/products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        addResult("Products (With Auth)", "success", {
          message: `Success! Found ${data.data?.length || 0} products`,
          productCount: data.data?.length || 0,
          firstProduct: data.data?.[0] || null,
          meta: data.meta || null,
        })
      } else {
        const errorText = await response.text()
        addResult("Products (With Auth)", "error", `HTTP ${response.status}: ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      addResult("Products (With Auth)", "error", `Error: ${error}`)
    }

    // Test 4: Products with populate
    try {
      addResult("Products (Populate)", "success", "Testing products with populate=*...")

      const response = await fetch(`${STRAPI_URL}/api/products?populate=*`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        addResult("Products (Populate)", "success", {
          message: `Success! Found ${data.data?.length || 0} products with relations`,
          productCount: data.data?.length || 0,
          firstProductAttributes: data.data?.[0]?.attributes || null,
          rawResponse: data,
        })
      } else {
        const errorText = await response.text()
        addResult("Products (Populate)", "error", `HTTP ${response.status}: ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      addResult("Products (Populate)", "error", `Error: ${error}`)
    }

    // Test 5: Categories endpoint
    try {
      addResult("Categories", "success", "Testing categories endpoint...")

      const response = await fetch(`${STRAPI_URL}/api/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        addResult("Categories", "success", {
          message: `Success! Found ${data.data?.length || 0} categories`,
          categories: data.data || [],
        })
      } else {
        const errorText = await response.text()
        addResult("Categories", "error", `HTTP ${response.status}: ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      addResult("Categories", "error", `Error: ${error}`)
    }

    setLoading(false)
  }

  const testDirectUrl = async () => {
    try {
      addResult("Direct URL Test", "success", "Testing direct URL access...")

      // Test if we can access Strapi directly
      window.open(`${STRAPI_URL}/admin`, "_blank")
      addResult("Direct URL Test", "success", "Opened Strapi admin in new tab - check if it loads")
    } catch (error) {
      addResult("Direct URL Test", "error", `Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">Strapi Connection Test</h1>

      <div className="mb-6 space-x-4">
        <Button onClick={runBasicTests} disabled={loading}>
          {loading ? "Running Tests..." : "Run All Tests"}
        </Button>
        <Button onClick={testDirectUrl} variant="outline">
          Test Direct URL
        </Button>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{result.test}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    result.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status}
                </span>
                <span className="text-xs text-gray-500">{result.timestamp}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded border overflow-auto max-h-60">
              <pre className="text-xs whitespace-pre-wrap">
                {typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Click "Run All Tests" to start testing your Strapi connection</p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">What This Tests:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            1. <strong>Basic Connectivity:</strong> Can we reach your Strapi server at all?
          </li>
          <li>
            2. <strong>Products (No Auth):</strong> Are products publicly accessible?
          </li>
          <li>
            3. <strong>Products (With Auth):</strong> Does your API token work?
          </li>
          <li>
            4. <strong>Products (Populate):</strong> Can we get products with images and categories?
          </li>
          <li>
            5. <strong>Categories:</strong> Do categories exist and are they accessible?
          </li>
        </ul>

        <div className="mt-4">
          <h4 className="font-medium text-blue-800 mb-1">Your Configuration:</h4>
          <div className="text-xs text-blue-600 space-y-1">
            <div>
              <strong>URL:</strong> {STRAPI_URL}
            </div>
            <div>
              <strong>Token:</strong> {STRAPI_TOKEN.substring(0, 20)}...{STRAPI_TOKEN.substring(-10)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
