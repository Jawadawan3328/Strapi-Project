import { NextResponse } from "next/server"

const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "4465ed8a35477d62adeec209ee300bb0524dccff957cecdcfa60089c29dcf243d0529f0e4f44f0ab156c63898cd7452b06501e403de6544ab0d02c049815a102d84c80e1f7b982f685f35b5e27573fe8dadccc6eef5f4481292e7a8e785f068a18dfb783ffe842530ed40d80fdf8d1cdac34a575df90b2e551145bb93628a9b3"

export async function GET() {
  const results = []

  // Test 1: Basic API access
  try {
    console.log("🔍 Testing basic API access...")

    const response = await fetch(`${STRAPI_URL}/api/products`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Response status:", response.status)
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      results.push({
        test: "Basic API Access",
        status: "success",
        data: {
          productCount: data.data?.length || 0,
          hasData: !!data.data,
          meta: data.meta,
        },
      })
    } else {
      const errorText = await response.text()
      results.push({
        test: "Basic API Access",
        status: "error",
        data: {
          status: response.status,
          statusText: response.statusText,
          error: errorText.substring(0, 500),
        },
      })
    }
  } catch (error) {
    results.push({
      test: "Basic API Access",
      status: "error",
      data: {
        error: String(error),
      },
    })
  }

  // Test 2: Server-side fetch with populate
  try {
    console.log("🔍 Testing with populate...")

    const response = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[limit]=1`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      results.push({
        test: "API with Populate",
        status: "success",
        data: {
          productCount: data.data?.length || 0,
          firstProduct: data.data?.[0] || null,
          rawData: data,
        },
      })
    } else {
      const errorText = await response.text()
      results.push({
        test: "API with Populate",
        status: "error",
        data: {
          status: response.status,
          error: errorText.substring(0, 500),
        },
      })
    }
  } catch (error) {
    results.push({
      test: "API with Populate",
      status: "error",
      data: {
        error: String(error),
      },
    })
  }

  return NextResponse.json({
    success: results.some((r) => r.status === "success"),
    results,
    config: {
      url: STRAPI_URL,
      tokenLength: STRAPI_TOKEN.length,
      tokenPreview: `${STRAPI_TOKEN.substring(0, 10)}...${STRAPI_TOKEN.substring(-10)}`,
    },
  })
}
