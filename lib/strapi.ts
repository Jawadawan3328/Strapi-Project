export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://devoted-desk-a04040503d.strapiapp.com"
export const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "06f1720304a5bc964df1eb88e365554a1b55afef2757c07263b2fac1df5395139628865f5f8a971e5cb197ff3b6cbb2095acde0d01a4bc6bea00ae22ebe3b6a07966ff4174807659232d297720ee25228e44bfbe363bbe191e8b5ee2125c0bc98911202063374bd924531e63902314a133f311213aa0e76639463de52406634a"
// Simplified product type for our components

export interface Product {
  id: number
  documentId: string
  title: string
  description: string
  price: number
  image: string | null
  imageAlt: string | null
  categories: string[]
  createdAt: string
}

// Helper function to safely extract text from blocks
function extractTextFromBlocks(blocks: any): string {
  if (!blocks || !Array.isArray(blocks)) return ""

  try {
    return blocks
      .map((block: any) => {
        if (block && block.children && Array.isArray(block.children)) {
          return block.children.map((child: any) => child?.text || "").join(" ")
        }
        return ""
      })
      .join(" ")
      .trim()
  } catch (error) {
    console.warn("Error extracting text from blocks:", error)
    return ""
  }
}

// Simplified API fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const { signal } = controller

  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

// Helper function to extract image URL with multiple fallbacks
function extractImageUrl(attrs: any): string | null {
  try {
    // Check if Image field exists
    if (!attrs.Image) {
      return null
    }

    // Try to get from Image.data
    if (attrs.Image.data) {
      const imageData = attrs.Image.data

      // Handle array of images
      if (Array.isArray(imageData) && imageData.length > 0) {
        // Try formats in order of preference
        const formats = ["large", "medium", "small", "thumbnail"]
        const firstImage = imageData[0]

        // Check if formats exist
        if (firstImage.attributes?.formats) {
          for (const format of formats) {
            if (firstImage.attributes.formats[format]?.url) {
              return firstImage.attributes.formats[format].url
            }
          }
        }

        // Fallback to main URL
        if (firstImage.attributes?.url) {
          return firstImage.attributes.url
        }
      }
      // Handle single image
      else if (imageData.attributes) {
        // Try formats in order of preference
        const formats = ["large", "medium", "small", "thumbnail"]

        // Check if formats exist
        if (imageData.attributes.formats) {
          for (const format of formats) {
            if (imageData.attributes.formats[format]?.url) {
              return imageData.attributes.formats[format].url
            }
          }
        }

        // Fallback to main URL
        if (imageData.attributes.url) {
          return imageData.attributes.url
        }
      }
    }

    // Try legacy format
    if (attrs.Image.url) {
      return attrs.Image.url
    }

    return null
  } catch (error) {
    console.error("Error extracting image URL:", error)
    return null
  }
}

// Make sure URL is absolute
function ensureAbsoluteUrl(url: string | null): string | null {
  if (!url) return null

  if (url.startsWith("http")) {
    return url
  }

  // Try with standard URL
  if (url.startsWith("/")) {
    return `${STRAPI_URL}${url}`
  }

  // Try with media subdomain
  if (url.includes("/uploads/")) {
    return `https://devoted-desk-a04040503d.media.strapiapp.com${url.startsWith("/") ? "" : "/"}${url}`
  }

  return url
}

export async function getProducts(): Promise<Product[]> {
  try {
    console.log("🔍 Fetching all products")

    // Use a simple, direct approach with timeout
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/products?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
      8000, // 8 second timeout
    )

    if (!response.ok) {
      console.error("❌ API error:", response.status, response.statusText)
      return []
    }

    const result = await response.json()
    console.log("✅ Products API response received")

    if (!result.data || !Array.isArray(result.data)) {
      console.error("❌ Unexpected data format:", result)
      return []
    }

    return result.data.map((item: any) => {
      try {
        // Fields are directly in the item object
        const title = item.title || "Untitled Product"
        const price = item.Price || 0

        // Handle image data
        const imageData = item.Image
        let imageUrl = null
        if (imageData) {
          if (Array.isArray(imageData)) {
            imageUrl = imageData[0]?.url
          } else {
            imageUrl = imageData.url
          }
          // Make URL absolute if it's relative
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${STRAPI_URL}${imageUrl}`
          }
        }

        // Handle description
        let description = ""
        const rawDescription = item.Description || ""
        if (Array.isArray(rawDescription)) {
          description = rawDescription
            .map(block => {
              if (block.type === 'paragraph' && Array.isArray(block.children)) {
                return block.children
                  .map((child: { text?: string }) => child.text || '')
                  .join('')
              }
              return ''
            })
            .join('\n')
            .trim()
        }

        // Handle category
        const categories: string[] = []
        if (item.category?.name) {
          categories.push(item.category.name)
        }

        return {
          id: item.id,
          documentId: item.documentId || item.id.toString(),
          title,
          description: description.length > 200 ? description.substring(0, 200) + "..." : description,
          price,
          image: imageUrl,
          imageAlt: title,
          categories,
          createdAt: item.createdAt
        }
      } catch (itemError) {
        console.error(`❌ Error processing item:`, itemError)
        return {
          id: item.id || 0,
          documentId: item.documentId || item.id?.toString() || "",
          title: "Error Loading Product",
          description: "There was an error loading this product",
          price: 0,
          image: null,
          imageAlt: "Error",
          categories: [],
          createdAt: new Date().toISOString(),
        }
      }
    })
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return []
  }
}

// Get products by category using Strapi filtering
export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    console.log(`🔍 Fetching products for category: "${categoryName}"`)

    // Use a simple approach with timeout
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/products?populate=*&filters[categories][name][$eq]=${categoryName}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
      8000, // 8 second timeout
    )

    if (!response.ok) {
      console.log(`❌ Category filter API error: ${response.status}`)
      // Fall back to client-side filtering
      const allProducts = await getProducts()
      return allProducts.filter((product) =>
        product.categories.some((cat) => cat.toLowerCase() === categoryName.toLowerCase()),
      )
    }

    const result = await response.json()

    if (!result.data || !Array.isArray(result.data)) {
      console.log(`❌ Unexpected category data format`)
      return []
    }

    // If we got results, process them
    if (result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} products for category "${categoryName}"`)
      return result.data.map((item: any) => {
        const attrs = item.attributes || {}
        const title = attrs.title || attrs.name || "Untitled Product"
        const price = attrs.Price || attrs.price || 0

        // Enhanced image extraction with multiple fallbacks
        const imageUrl = ensureAbsoluteUrl(extractImageUrl(attrs))

        // Extract description
        let description = ""
        const rawDescription = attrs.Description || attrs.description || ""
        if (typeof rawDescription === "string") {
          description = rawDescription
        } else {
          description = extractTextFromBlocks(Array.isArray(rawDescription) ? rawDescription : [rawDescription])
        }

        return {
          id: item.id || 0,
          documentId: item.documentId || item.id?.toString() || "",
          title,
          description: description.length > 200 ? description.substring(0, 200) + "..." : description,
          price,
          image: imageUrl,
          imageAlt: title,
          categories: [categoryName], // We know this product has this category
          createdAt: attrs.createdAt || new Date().toISOString(),
        }
      })
    }

    // If no results, try client-side filtering
    console.log(`⚠️ No products found with server filtering, trying client-side`)
    const allProducts = await getProducts()
    return allProducts.filter((product) =>
      product.categories.some((cat) => cat.toLowerCase() === categoryName.toLowerCase()),
    )
  } catch (error) {
    console.error(`❌ Error fetching products by category "${categoryName}":`, error)
    return []
  }
}

// Get sale products (products with discount or special pricing)
export async function getSaleProducts(): Promise<Product[]> {
  try {
    // Try to find products with "sale" category first
    const saleByCategory = await getProductsByCategory("sale")

    if (saleByCategory.length > 0) {
      console.log(`✅ Found ${saleByCategory.length} products with "sale" category`)
      return saleByCategory
    }

    // Fallback to demo logic
    console.log(`⚠️ No products with "sale" category found, using demo logic`)
    const allProducts = await getProducts()
    const saleProducts = allProducts.filter((_, index) => index % 3 === 0)
    console.log(`✅ Selected ${saleProducts.length} products as sale items using demo logic`)

    return saleProducts
  } catch (error) {
    console.error("❌ Error fetching sale products:", error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    console.log("🔍 Fetching product by ID:", id)

    // First, try to get all products and find the one we need
    // This is more reliable than trying to guess the correct API endpoint
    const allProducts = await getProducts()

    if (allProducts.length === 0) {
      console.log("❌ No products available")
      return null
    }

    // Try to find by ID or documentId
    const product = allProducts.find((p) => p.id.toString() === id || p.documentId === id)

    if (product) {
      console.log(`✅ Found product "${product.title}" by ID/documentId`)
      return product
    }

    // If not found, try direct API call with different approaches
    const endpoints = [
      `${STRAPI_URL}/api/products/${id}?populate=*`,
      `${STRAPI_URL}/api/products?filters[id][$eq]=${id}&populate=*`,
      `${STRAPI_URL}/api/products?filters[documentId][$eq]=${id}&populate=*`,
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`)

        const response = await fetchWithTimeout(
          endpoint,
          {
            headers: {
              Authorization: `Bearer ${STRAPI_TOKEN}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
          8000, // 8 second timeout
        )

        if (response.ok) {
          const result = await response.json()
          console.log("✅ Product response received from", endpoint)

          let item = null

          // Handle different response formats
          if (result.data) {
            if (Array.isArray(result.data)) {
              item = result.data[0] // Filter response
            } else {
              item = result.data // Direct ID response
            }
          }

          if (!item) {
            console.log("❌ No product data in response")
            continue
          }

          const attrs = item.attributes || {}
          const title = attrs.title || attrs.name || "Untitled Product"
          const price = attrs.Price || attrs.price || 0

          // Enhanced image extraction with multiple fallbacks
          const imageUrl = ensureAbsoluteUrl(extractImageUrl(attrs))

          // Extract description
          let description = ""
          const rawDescription = attrs.Description || attrs.description || ""
          if (typeof rawDescription === "string") {
            description = rawDescription
          } else {
            description = extractTextFromBlocks(Array.isArray(rawDescription) ? rawDescription : [rawDescription])
          }

          // Simplified category extraction
          const categories: string[] = []
          if (attrs.categories?.data) {
            const catData = attrs.categories.data
            if (Array.isArray(catData)) {
              catData.forEach((cat) => {
                if (cat.attributes?.name) {
                  categories.push(cat.attributes.name)
                }
              })
            }
          }

          if (attrs.category?.data?.attributes?.name) {
            categories.push(attrs.category.data.attributes.name)
          }

          return {
            id: item.id || 0,
            documentId: item.documentId || item.id?.toString() || "",
            title,
            description,
            price,
            image: imageUrl,
            imageAlt: title,
            categories,
            createdAt: attrs.createdAt || new Date().toISOString(),
          }
        } else {
          console.log(`❌ Endpoint failed: ${response.status} ${response.statusText}`)
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint error:`, endpointError)
        continue
      }
    }

    console.log(`❌ Product with ID "${id}" not found in any endpoint`)
    return null
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return null
  }
}

export function getStrapiImageUrl(url: string): string {
  return ensureAbsoluteUrl(url) || ""
}

interface FetchOptions {
  endpoint: string;
  query?: Record<string, any>;
  wrappedByData?: boolean;
}

export async function fetchFromStrapi<T>({ endpoint, query, wrappedByData = true }: FetchOptions): Promise<T> {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'your_strapi_url_here';
  const strapiToken = process.env.STRAPI_API_TOKEN;

  // Construct query string
  const queryString = query
    ? `?${Object.entries(query)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    : '';

  const response = await fetch(`${strapiUrl}/api/${endpoint}${queryString}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${strapiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return wrappedByData ? result.data : result;
}

// Example type for Strapi response
export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  }[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
