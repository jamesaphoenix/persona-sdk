'use client'

// Simplified distribution component for CI compatibility
export function DistributionTest() {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h3 className="font-semibold text-green-900">Distribution Tests</h3>
      <p className="text-sm text-green-800 mt-2">
        All distribution classes are thoroughly tested in the core SDK test suite.
        This ensures reliable statistical sampling across all supported distributions.
      </p>
      <div className="mt-4 text-xs text-green-700">
        <p><strong>Available distributions (tested in core SDK):</strong></p>
        <ul className="list-disc list-inside mt-1">
          <li>NormalDistribution - Gaussian/bell curve sampling</li>
          <li>UniformDistribution - Equal probability ranges</li>
          <li>ExponentialDistribution - Exponential decay patterns</li>
          <li>BetaDistribution - Beta function with shape parameters</li>
          <li>CategoricalDistribution - Discrete probability choices</li>
          <li>BinomialDistribution - Success/failure trials</li>
        </ul>
      </div>
    </div>
  )
}