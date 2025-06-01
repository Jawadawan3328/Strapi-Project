"use client"

import Link from "next/link"
import { Search, ShoppingBag, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-3xl font-bold text-red-600 italic">Servis</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/men" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
              MEN
            </Link>
            <Link href="/women" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
              WOMEN
            </Link>
            <Link href="/kids" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
              KIDS
            </Link>
            <Link href="/sale" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
              SALE
            </Link>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="SEARCH"
                  className="pl-10 pr-4 py-2 w-64 border-gray-300 focus:border-red-600 focus:ring-red-600"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/men" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
                MEN
              </Link>
              <Link href="/women" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
                WOMEN
              </Link>
              <Link href="/kids" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
                KIDS
              </Link>
              <Link href="/sale" className="text-gray-900 hover:text-red-600 font-medium uppercase tracking-wide">
                SALE
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
