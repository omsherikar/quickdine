import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'delivered'

interface OrderStatusProps {
  status: OrderStatus
  orderId: string
  estimatedTime?: string
}

const statusSteps = [
  { id: 'confirmed', label: 'Order Confirmed' },
  { id: 'preparing', label: 'Preparing Your Order' },
  { id: 'ready', label: 'Ready for Pickup' },
  { id: 'delivered', label: 'Delivered' },
]

export default function OrderStatus({ status, orderId, estimatedTime = '15-20 minutes' }: OrderStatusProps) {
  const currentStepIndex = statusSteps.findIndex(step => step.id === status)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
        <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        <p className="text-sm text-gray-500 mt-1">
          Estimated time: {estimatedTime}
        </p>
      </div>

      <div className="relative">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="relative pb-8">
              {index !== statusSteps.length - 1 && (
                <div
                  className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                    isCompleted ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="relative flex items-start">
                <div className="flex h-8 items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    ) : (
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 