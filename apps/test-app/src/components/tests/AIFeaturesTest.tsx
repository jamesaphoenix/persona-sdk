'use client'

// AI features disabled in browser build to avoid server-side module conflicts
export function AIFeaturesTest() {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h3 className="font-semibold text-yellow-900">AI Features Test</h3>
      <p className="text-sm text-yellow-800 mt-2">
        AI features require server-side APIs and are disabled in the browser build to avoid Node.js module conflicts.
        These features work in the main SDK when used in server environments.
      </p>
      <div className="mt-4 text-xs text-yellow-700">
        <p><strong>Available in server environments:</strong></p>
        <ul className="list-disc list-inside mt-1">
          <li>DistributionSelectorLangChain</li>
          <li>StructuredOutputGenerator</li>
          <li>MediaToPersonaGenerator</li>
          <li>Political Analysis Framework</li>
        </ul>
      </div>
    </div>
  )
}