import { Button } from '@/components/ui/button';
import { PlanBadge } from './plan-badge'; // Assuming PlanBadge is in the same directory

interface PricingTableProps {
  currentPlan: 'free' | 'pro' | 'agency';
}

export function PricingTable({ currentPlan }: PricingTableProps) {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0',
      features: [
        '10 Projects',
        '5 Users',
        'Basic Support',
        'Limited Storage',
      ],
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '29',
      features: [
        'Unlimited Projects',
        '20 Users',
        'Priority Support',
        '100 GB Storage',
        'Advanced Features',
      ],
      recommended: true,
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '99',
      features: [
        'Unlimited Projects',
        'Unlimited Users',
        'Dedicated Support',
        'Unlimited Storage',
        'All Pro Features',
        'Client Management',
      ],
      recommended: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            'border rounded-lg p-6 flex flex-col relative',
            plan.recommended ? 'border-purple-600 shadow-lg' : 'border-gray-200',
            currentPlan === plan.id ? 'bg-gray-50' : ''
          )}
        >
          {plan.recommended && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <PlanBadge plan="agency" size="sm" /> {/* Assuming 'agency' is used for the recommended badge */}
            </div>
          )}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            {plan.price === '0' ? (
              <span className="text-4xl font-bold">Free</span>
            ) : (
              <span className="text-4xl font-bold flex items-baseline justify-center">
                €{plan.price}
                <span className="text-base font-normal text-gray-500 ml-1">/month</span>
              </span>
            )}
          </div>
          <ul className="mb-8 space-y-3 flex-grow">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center text-gray-700">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            {currentPlan === plan.id ? (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button
                className={plan.recommended ? '' : 'bg-purple-600 hover:bg-purple-700'}
                disabled={plan.id === 'agency' && currentPlan !== 'agency'} // Disable 'Agency' upgrade if not already agency but allow button to show
              >
                {plan.id === 'agency' && currentPlan !== 'agency' ? 'Contact Us' : 'Get Started'}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Placeholder for CheckCircleIcon if not globally available
// In a real app, this would be imported from lucide-react or similar
function CheckCircleIcon(props: { className?: string; w?: number; h?: number; }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  );
}

// Placeholder for cn utility if not globally available
// In a real app, this would be imported from '@/lib/utils' or similar
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
