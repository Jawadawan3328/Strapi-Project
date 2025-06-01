import { NextResponse } from "next/server"

const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "2b0bbc326565e0b607ac680fd1c2a46ee65ae9184638c3c15f641a839d1fbaf37a3759ed9e92c4d70473fa07a2c5e988716f42201fd5a35945e745d0a61a697f1b4d7bb0cf11d4685450aa3b8074e9babec9e928c659e93bece46947bc2139bf625ad9730cc0d53505cdd475b9cdaff227ade428a680346a2d269296ae5a29f7"

export async function GET() {
  try {
    console.log("🔍 Testing Strapi API connection...")

    const response = await fetch(`${STRAPI_URL}/api/products?pagination[limit]=1`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Response status:", response.status)
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API error:", errorText)
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText.substring(0, 500),
      })
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      return NextResponse.json({
        success: false,
        error: `Expected JSON but got ${contentType}`,
        details: text.substring(0, 500),
      })
    }

    const data = await response.json()
    console.log("✅ API response successful")

    return NextResponse.json({
      success: true,
      productCount: data.meta?.pagination?.total || 0,
      hasProducts: data.data && data.data.length > 0,
      firstProduct: data.data?.[0] || null,
    })
  } catch (error) {
    console.error("❌ API test failed:", error)
    return NextResponse.json({
      success: false,
      error: String(error),
    })
  }
}
