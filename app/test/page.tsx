import { STRAPI_URL, STRAPI_TOKEN } from '@/lib/strapi';

async function testStrapiConnection() {
  const endpoints = [
    // Test basic API access
    { name: 'API Health Check', url: `${STRAPI_URL}/api/products` },
    // Test with population
    { name: 'Products with Population', url: `${STRAPI_URL}/api/products?populate=*` },
    // Test content-type structure
    { name: 'Content-Type Check', url: `${STRAPI_URL}/api/content-type-builder/content-types` },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint.url}`);
      const response = await fetch(endpoint.url, {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = 'Non-JSON response';
      }
      
      results.push({
        name: endpoint.name,
        status: response.status,
        ok: response.ok,
        contentType,
        data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
      });
    } catch (error: any) {
      results.push({
        name: endpoint.name,
        status: 'Error',
        ok: false,
        error: error?.message || 'Unknown error occurred',
      });
    }
  }

  return results;
}

export default async function TestPage() {
  const results = await testStrapiConnection();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Strapi Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Configuration:</h2>
        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
          <p><strong>STRAPI_URL:</strong> {STRAPI_URL}</p>
          <p><strong>STRAPI_TOKEN:</strong> {STRAPI_TOKEN ? '✓ Present' : '✗ Missing'}</p>
          <p><strong>Token Preview:</strong> {STRAPI_TOKEN ? `${STRAPI_TOKEN.substring(0, 10)}...` : 'N/A'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Common Issues:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure you have created and published products in your Strapi admin panel</li>
          <li>Verify that your API token has the following permissions:
            <ul className="list-circle pl-5 mt-1">
              <li>Product: find, findOne</li>
              <li>Upload: upload</li>
            </ul>
          </li>
          <li>Check if your products have all required fields filled out</li>
        </ul>
      </div>

      <div className="space-y-6">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg ${
              result.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <h3 className="font-semibold mb-2">{result.name}</h3>
            <div className="space-y-2">
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Success:</strong> {result.ok ? 'Yes' : 'No'}</p>
              {result.contentType && (
                <p><strong>Content Type:</strong> {result.contentType}</p>
              )}
              {result.error && (
                <div className="mt-2">
                  <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                </div>
              )}
              {result.data && (
                <div className="mt-2">
                  <p className="font-semibold mb-1">Response Data:</p>
                  <pre className="bg-white p-2 rounded text-sm overflow-x-auto max-h-96">
                    {result.data}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Next Steps:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>If all tests fail: Check your API token permissions in Strapi Admin</li>
          <li>If tests pass but return empty data: Create and publish products in Strapi</li>
          <li>If some tests pass: Check the specific error messages for failed tests</li>
        </ol>
      </div>
    </div>
  );
} 