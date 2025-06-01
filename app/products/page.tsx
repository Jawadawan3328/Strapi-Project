import { getProducts, Product } from '@/lib/strapi';
import Image from 'next/image';

export default async function ProductsPage() {
  const products = await getProducts();

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-600">No products found</h2>
          <p className="text-gray-500 mt-2">Please check back later for our product listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            {product.image && (
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={product.image}
                  alt={product.imageAlt || product.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
            <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </p>
              {product.categories.length > 0 && (
                <div className="flex gap-2">
                  {product.categories.map((category, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 