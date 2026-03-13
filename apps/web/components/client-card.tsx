import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlanBadge } from './plan-badge'; // Assuming PlanBadge is in the same directory
import { cn } from '@/lib/utils'; // Assuming cn is available

interface ClientCardProps {
  org: {
    id: string;
    name: string;
    use_cases_count: number;
    high_risk_count: number;
    compliance_percentage: number; // e.g., 75 for 75%
  };
  onManage: (orgId: string) => void;
}

export function ClientCard({ org, onManage }: ClientCardProps) {
  const complianceColor = org.compliance_percentage > 75 ? 'text-green-600' : org.compliance_percentage > 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{org.name}</CardTitle>
        {/* Assuming Agency plan is the differentiator for managing orgs */}
        <CardDescription>Org ID: {org.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Use Cases Processed</span>
            <span className="font-medium">{org.use_cases_count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">High Risk Items</span>
            <span className="font-medium">{org.high_risk_count}</span>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Compliance Status</span>
            <span className={cn('font-bold', complianceColor)}>
              {org.compliance_percentage}%
            </span>
          </div>
          <Progress value={org.compliance_percentage} className={cn(
            'h-3',
            org.compliance_percentage > 75 ? 'bg-green-50' : org.compliance_percentage > 50 ? 'bg-amber-50' : 'bg-red-50'
          )} />
        </div>
      </CardContent>
      <CardFooter className="flex-shrink-0 mt-auto">
        <Button variant="outline" onClick={() => onManage(org.id)} className="w-full">
          Manage →
        </Button>
      </CardFooter>
    </Card>
  );
}

// Placeholder for cn utility if not globally available
// In a real app, this would be imported from '@/lib/utils' or similar
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
