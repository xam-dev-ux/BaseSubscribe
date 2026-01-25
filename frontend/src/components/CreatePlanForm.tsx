import { useState } from 'react'
import { useCreatePlan } from '../hooks/useContract'
import { parseUSDC } from '../utils/formatters'

export function CreatePlanForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [periodDays, setPeriodDays] = useState('30')

  const { createPlan, isPending, isConfirming, isSuccess, error } = useCreatePlan()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const priceInUSDC = parseUSDC(price)
    const periodInSeconds = BigInt(Number(periodDays) * 24 * 60 * 60)

    createPlan(priceInUSDC, periodInSeconds, name, description)
  }

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-900/20 border border-green-800 rounded-xl text-center">
        <p className="text-green-400 font-medium">Plan created successfully!</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          Create Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Plan Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Premium Access"
          required
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-base-blue"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What subscribers will get..."
          rows={3}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-base-blue resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Price (USDC)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="10"
            step="0.01"
            min="0.01"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-base-blue"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Billing Period</label>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-base-blue"
          >
            <option value="7">Weekly</option>
            <option value="30">Monthly</option>
            <option value="365">Yearly</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full py-3 bg-base-blue hover:bg-blue-600 rounded-lg font-medium transition disabled:opacity-50"
      >
        {isPending || isConfirming ? 'Creating...' : 'Create Plan'}
      </button>
    </form>
  )
}
