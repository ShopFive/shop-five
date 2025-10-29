'use client';

import { useState } from 'react';

export default function DebugGalleryAPI() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://n8n.srv880249.hstgr.cloud/webhook/gallery-images');
      const data = await res.json();
      setResponse(data);
      console.log('Full API Response:', data);
      
      // Log each group
      if (data.imageGroups) {
        data.imageGroups.forEach((group: any, index: number) => {
          console.log(`Group ${index}:`, {
            name: group.name,
            category: group.category,
            type: group.type,
            hasOriginal: group.original !== null,
            hasVariations: group.variations?.length || 0,
            hasProcessed: group.processed !== undefined
          });
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold"
      >
        {loading ? '⏳ Testing...' : '🔍 Debug API'}
      </button>

      {response && (
        <div className="mt-4 bg-white border-2 border-purple-600 rounded-lg shadow-xl p-4 max-w-2xl max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">API Response:</h3>
            <button
              onClick={() => setResponse(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Stats */}
          {response.stats && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h4 className="font-semibold mb-2">📊 Stats:</h4>
              <pre className="text-xs">{JSON.stringify(response.stats, null, 2)}</pre>
            </div>
          )}

          {/* Image Groups Summary */}
          {response.imageGroups && (
            <div className="mb-4 p-3 bg-green-50 rounded">
              <h4 className="font-semibold mb-2">📸 Groups ({response.imageGroups.length}):</h4>
              {response.imageGroups.map((group: any, index: number) => (
                <div key={index} className="text-xs mb-2 p-2 bg-white rounded border">
                  <div><strong>Name:</strong> {group.name}</div>
                  <div><strong>Category:</strong> {group.category}</div>
                  <div><strong>Type:</strong> {group.type || 'MISSING!'}</div>
                  {group.type === 'old' && (
                    <>
                      <div><strong>Original:</strong> {group.original ? '✅' : '❌'}</div>
                      <div><strong>Variations:</strong> {group.variations?.length || 0}</div>
                    </>
                  )}
                  {group.type === 'new' && (
                    <>
                      <div><strong>Original Front:</strong> {group.original?.front ? '✅' : '❌'}</div>
                      <div><strong>Original Back:</strong> {group.original?.back ? '✅' : '❌'}</div>
                      <div><strong>Processed Front:</strong> {group.processed?.front ? '✅' : '❌'}</div>
                      <div><strong>Processed Back:</strong> {group.processed?.back ? '✅' : '❌'}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Full Response */}
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold mb-2">🔍 Full JSON Response</summary>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}