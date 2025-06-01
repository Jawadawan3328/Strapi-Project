import { getProducts, STRAPI_URL, STRAPI_TOKEN } from '@/lib/strapi';

async function getRawStrapiData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/products?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching raw data:', error);
    return null;
  }
}

export default async function DebugPage() {
  console.log('Starting debug page render...');
  
  let products;
  let error: Error | null = null;
  let rawData;
  
  try {
    console.log('Attempting to fetch products...');
    products = await getProducts();
    rawData = await getRawStrapiData();
    console.log('Products fetched:', products);
    console.log('Raw data:', rawData);
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unknown error occurred');
    console.error('Error fetching products:', e);
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Product Debug Information</h1>

      <div className="space-y-6">
        {/* Status Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Fetch Status</h2>
          <p><strong>Products Found:</strong> {products ? products.length : 0}</p>
          <p><strong>Status:</strong> {error ? 'Error' : products ? 'Success' : 'No Products'}</p>
          {error && (
            <div className="mt-2 p-4 bg-red-50 rounded">
              <p className="text-red-600"><strong>Error:</strong> {error.message}</p>
            </div>
          )}
        </div>

        {/* Raw API Response */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Raw API Response</h2>
          <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>

        {/* Products Data */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Processed Products Data</h2>
          {products && products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id} className="border p-4 rounded bg-white">
                  <h3 className="font-semibold">Product {index + 1}</h3>
                  <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                    {JSON.stringify(product, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No products available</p>
          )}
        </div>

        {/* Field Mapping Info */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Field Mapping Check</h2>
          <p className="mb-2">Make sure your Strapi content type has these fields:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Title (Text field)</li>
            <li>Description (Rich text or Text field)</li>
            <li>Price (Number field)</li>
            <li>Image (Media field)</li>
            <li>Categories (Relation to Category content type)</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">Note: Field names are case-sensitive. They should match exactly as shown above.</p>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Check if the raw API response shows your updated product data</li>
            <li>Verify that the field names in Strapi match exactly with what the code expects</li>
            <li>Make sure you're editing the correct products (check IDs)</li>
            <li>Try creating a new product from scratch to test the field mapping</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
