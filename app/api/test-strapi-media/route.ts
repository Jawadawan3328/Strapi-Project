import { NextResponse } from "next/server"

const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "2b0bbc326565e0b607ac680fd1c2a46ee65ae9184638c3c15f641a839d1fbaf37a3759ed9e92c4d70473fa07a2c5e988716f42201fd5a35945e745d0a61a697f1b4d7bb0cf11d4685450aa3b8074e9babec9e928c659e93bece46947bc2139bf625ad9730cc0d53505cdd475b9cdaff227ade428a680346a2d269296ae5a29f7"

export async function GET() {
  try {
    console.log("🔍 Testing Strapi media access...")

    // Test 1: Basic API connection
    const apiTest = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[limit]=1`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!apiTest.ok) {
      return NextResponse.json({
        success: false,
        error: "API connection failed",
        status: apiTest.status,
        statusText: apiTest.statusText,
      })
    }

    const apiData = await apiTest.json()
    console.log("✅ API connection successful")

    // Test 2: Extract image URLs from the response
    const imageUrls: string[] = []
    if (apiData.data && Array.isArray(apiData.data)) {
      for (const item of apiData.data) {
        const attrs = item.attributes || {}
        if (attrs.Image?.data) {
          const imageData = attrs.Image.data

          if (Array.isArray(imageData)) {
            imageData.forEach((img) => {
              if (img.attributes?.url) {
                imageUrls.push(img.attributes.url)
              }
            })
          } else if (imageData.attributes?.url) {
            imageUrls.push(imageData.attributes.url)
          }
        }
      }
    }

    console.log("📸 Found image URLs:", imageUrls)

    // Test 3: Try to access media files directly
    const mediaTests = []
    for (const url of imageUrls.slice(0, 3)) {
      // Test first 3 images
      const fullUrl = url.startsWith("http") ? url : `${STRAPI_URL}${url}`

      try {
        const mediaResponse = await fetch(fullUrl, {
          method: "HEAD", // Just check if accessible
        })

        mediaTests.push({
          url: fullUrl,
          accessible: mediaResponse.ok,
          status: mediaResponse.status,
          contentType: mediaResponse.headers.get("content-type"),
          contentLength: mediaResponse.headers.get("content-length"),
        })
      } catch (error) {
        mediaTests.push({
          url: fullUrl,
          accessible: false,
          error: String(error),
        })
      }
    }

    // Test 4: Check upload settings
    let uploadSettings = null
    try {
      const uploadTest = await fetch(`${STRAPI_URL}/api/upload/settings`, {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      })

      if (uploadTest.ok) {
        uploadSettings = await uploadTest.json()
      }
    } catch (error) {
      console.log("Upload settings not accessible:", error)
    }

    return NextResponse.json({
      success: true,
      apiConnection: true,
      productCount: apiData.meta?.pagination?.total || 0,
      imageUrls,
      mediaTests,
      uploadSettings,
      recommendations: [
        imageUrls.length === 0 ? "❌ No images found in products" : "✅ Images found in products",
        mediaTests.some((test) => test.accessible)
          ? "✅ Some media files are accessible"
          : "❌ Media files are not accessible",
        "Check Strapi Settings > Media Library > Provider settings",
        "Ensure 'Public' access is enabled for media files",
        "Check if CORS is properly configured in Strapi",
      ],
    })
  } catch (error) {
    console.error("❌ Strapi media test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        recommendations: [
          "Check if Strapi URL is correct",
          "Verify API token has proper permissions",
          "Check network connectivity",
          "Look for CORS issues",
        ],
      },
      { status: 500 },
    )
  }
}
