// Simplified Strapi functions for testing
const STRAPI_URL = "https://devoted-desk-a04040503d.strapiapp.com"
const STRAPI_TOKEN =
  "2b0bbc326565e0b607ac680fd1c2a46ee65ae9184638c3c15f641a839d1fbaf37a3759ed9e92c4d70473fa07a2c5e988716f42201fd5a35945e745d0a61a697f1b4d7bb0cf11d4685450aa3b8074e9babec9e928c659e93bece46947bc2139bf625ad9730cc0d53505cdd475b9cdaff227ade428a680346a2d269296ae5a29f7"

export async function testStrapiConnection() {
  try {
    console.log("🔍 Testing basic Strapi connection...")

    const response = await fetch(`${STRAPI_URL}/api/products?pagination[limit]=1`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Basic connection successful")

    return {
      success: true,
      productCount: data.meta?.pagination?.total || 0,
      hasProducts: data.data && data.data.length > 0,
    }
  } catch (error) {
    console.error("❌ Connection failed:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}

export async function getFirstProductWithImage() {
  try {
    console.log("🔍 Getting first product with populate...")

    const response = await fetch(`${STRAPI_URL}/api/products?populate=*&pagination[limit]=1`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Product with populate successful")
    console.log("📊 Full response:", JSON.stringify(data, null, 2))

    if (!data.data || data.data.length === 0) {
      return { success: false, error: "No products found" }
    }

    const product = data.data[0]
    const attrs = product.attributes || {}

    // Try to extract image URL step by step
    let imageUrl = null
    const imageDebugInfo = {}

    if (attrs.Image) {
      console.log("🖼️ Image field exists:", attrs.Image)
      imageDebugInfo.hasImageField = true
      imageDebugInfo.imageFieldType = Array.isArray(attrs.Image) ? "array" : typeof attrs.Image

      // Handle different structures
      if (attrs.Image.data) {
        console.log("📸 Image has data property:", attrs.Image.data)
        imageDebugInfo.hasDataProperty = true

        const imageData = attrs.Image.data
        if (Array.isArray(imageData)) {
          console.log("📸 Image data is array, length:", imageData.length)
          imageDebugInfo.isArray = true
          imageDebugInfo.arrayLength = imageData.length

          if (imageData.length > 0 && imageData[0].attributes) {
            imageUrl = imageData[0].attributes.url
            console.log("📸 Found URL in first array item:", imageUrl)
          }
        } else if (imageData.attributes) {
          imageUrl = imageData.attributes.url
          console.log("📸 Found URL in single object:", imageUrl)
        }
      }
    } else {
      console.log("❌ No Image field found")
      imageDebugInfo.hasImageField = false
    }

    // Make URL absolute if needed
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${STRAPI_URL}${imageUrl}`
      console.log("🔗 Made URL absolute:", imageUrl)
    }

    return {
      success: true,
      product: {
        id: product.id,
        title: attrs.title || attrs.name || "No title",
        price: attrs.Price || attrs.price || 0,
        imageUrl,
        imageDebugInfo,
      },
      rawData: data,
    }
  } catch (error) {
    console.error("❌ Error getting product:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
