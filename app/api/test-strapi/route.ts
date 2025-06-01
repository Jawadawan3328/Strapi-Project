import { NextResponse } from "next/server"

// Direct API calls to your Strapi cloud
const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "2b0bbc326565e0b607ac680fd1c2a46ee65ae9184638c3c15f641a839d1fbaf37a3759ed9e92c4d70473fa07a2c5e988716f42201fd5a35945e745d0a61a697f1b4d7bb0cf11d4685450aa3b8074e9babec9e928c659e93bece46947bc2139bf625ad9730cc0d53505cdd475b9cdaff227ade428a680346a2d269296ae5a29f7"

export async function GET(request: Request) {
  try {
    // Get the first product to analyze its structure
    const response = await fetch(`${STRAPI_URL}/api/products?populate=*&limit=1`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Strapi", status: response.status },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Get available categories
    const categoriesResponse = await fetch(`${STRAPI_URL}/api/categories`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    let categories = []
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      categories = categoriesData.data || []
    }

    return NextResponse.json({
      message: "Strapi connection test successful",
      firstProduct: data.data?.[0] || null,
      categories,
      productCount: data.meta?.pagination?.total || 0,
    })
  } catch (error) {
    console.error("Error testing Strapi connection:", error)
    return NextResponse.json({ error: "Failed to connect to Strapi" }, { status: 500 })
  }
}
