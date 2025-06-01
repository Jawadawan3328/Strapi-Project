"use client"

import { Button } from "@/components/ui/button"
import { Filter, ChevronUp } from "lucide-react"
import { useState } from "react"

interface ProductFiltersProps {
  productCount: number
}

export default function ProductFilters({ productCount }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Show Filters
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{productCount} Products</span>
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronUp className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
