"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/strapi"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, title, price, image, imageAlt, categories, description } = product

  // For demo purposes, let's add some random discount logic
  const hasDiscount = Math.random() > 0.5
  const discountPercentage = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0
  const originalPrice = hasDiscount ? Math.floor(price * 1.3) : undefined

  return (
    <Link href={`/product/${id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-square bg-gray-100">
          {/* Simple image with fallback */}
          {image ? (
            <img
              src={image || "/placeholder.svg"}
              alt={imageAlt || title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error(`❌ Image failed to load for "${title}":`, image)
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}

          {/* Fallback for failed images */}
          <div className="hidden w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">❌</div>
              <div className="text-sm">Image Failed</div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">New</Badge>
            {discountPercentage > 0 && (
              <Badge className="bg-red-600 text-white text-xs px-2 py-1">-{discountPercentage}%</Badge>
            )}
          </div>

          {/* Online Exclusive Discount Label */}
          {discountPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white text-xs text-center py-1">
              ONLINE EXCLUSIVE DISCOUNT
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{title}</h3>

          {/* Show categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Show description preview */}
          {description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{description}</p>}

          {/* Price */}
          <div className="flex items-center gap-2">
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">Rs.{originalPrice.toLocaleString()}.00</span>
            )}
            <span className="text-sm font-semibold text-gray-900">Rs.{price.toLocaleString()}.00</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
