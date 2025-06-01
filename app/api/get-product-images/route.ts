import { NextResponse } from "next/server"

const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "2b0bbc326565e0b607ac680fd1c2a46ee65ae9184638c3c15f641a839d1fbaf37a3759ed9e92c4d70473fa07a2c5e988716f42201fd5a35945e745d0a61a697f1b4d7bb0cf11d4685450aa3b8074e9babec9e928c659e93bece46947bc2139bf625ad9730cc0d53505cdd475b9cdaff227ade428a680346a2d269296ae5a29f7"

export async function GET() {
  try {
    console.log("🔍 Getting product images...")

    const response = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[limit]=5`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText.substring(0, 500),
      })
    }

    const data = await response.json()
    const imageUrls: string[] = []

    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        const attrs = item.attributes || {}
        if (attrs.Image?.data) {
          const imageData = attrs.Image.data

          if (Array.isArray(imageData)) {
            imageData.forEach((img) => {
              if (img.attributes?.url) {
                const url = img.attributes.url.startsWith("http")
                  ? img.attributes.url
                  : `${STRAPI_URL}${img.attributes.url}`
                imageUrls.push(url)
              }
            })
          } else if (imageData.attributes?.url) {
            const url = imageData.attributes.url.startsWith("http")
              ? imageData.attributes.url
              : `${STRAPI_URL}${imageData.attributes.url}`
            imageUrls.push(url)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imageUrls,
      productCount: data.data?.length || 0,
      rawData: data,
    })
  } catch (error) {
    console.error("❌ Error getting product images:", error)
    return NextResponse.json({
      success: false,
      error: String(error),
    })
  }
}
