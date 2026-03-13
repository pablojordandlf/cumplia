import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskBadge } from './risk-badge'; // Assuming RiskBadge is in the same directory
import { cn } from '@/lib/utils'; // Assuming cn utility is available

// Define the available risk levels
type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';

// Define the available status values
type UseCaseStatus = 'draft' | 'active' | 'archived';

interface UseCaseCardProps {
  id: string;
  name: string;
  description: string;
  sector: string;
  riskLevel: RiskLevel;
  status: UseCaseStatus;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void; // Added onView for potential detail view
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({
  id,
  name,
  description,
  sector,
  riskLevel,
  status,
  onEdit,
  onDelete,
  onView,
}) => {
  const riskColorClass = {
    prohibited: 'border-l-red-600',
    high: 'border-l-orange-600',
    limited: 'border-l-yellow-600',
    minimal: 'border-l-green-600',
    unclassified: 'border-l-gray-500',
  };

  const statusBadgeClass = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    archived: 'bg-orange-100 text-orange-700',
  };

  // Truncate description to approximately 2 lines
  const truncatedDescription = description.length > 80 ? description.substring(0, 80) + '...' : description;

  return (
    <Card
      className={cn(
        'relative w-full group overflow-hidden transition-all duration-200 ease-in-out shadow-sm hover:shadow-md',
        riskColorClass[riskLevel],
        'hover:-translate-y-0.5'
      )}
    >
      <CardHeader className="p-4 pb-0"> {/* Reduced padding bottom */}
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 truncate pr-4"> {/* Added pr-4 to prevent overflow */}
            {name}
          </CardTitle>
          <div className="flex space-x-1.5"> {/* Use space-x for icons */}
             {onView && (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Ver detalles" 
                className="text-gray-400 hover:text-blue-600 hover:bg-gray-100 w-8 h-8"
                onClick={() => onView(id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Editar caso de uso" 
                className="text-gray-400 hover:text-blue-600 hover:bg-gray-100 w-8 h-8"
                onClick={() => onEdit(id)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Eliminar caso de uso" 
                className="text-gray-400 hover:text-red-600 hover:bg-gray-100 w-8 h-8"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2"> {/* Reduced padding top */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3"> {/* Ensure description is max 2 lines */}
          {description}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-700 borde mb-1"> {/* Using a neutral badge for sector */}
            {sector}
          </Badge>
          <div className="flex items-center gap-2">
             <RiskBadge level={riskLevel} size="sm" showIcon={false} /> {/* showIcon set to false to keep card cleaner, modify as needed */}
             <Badge className={cn("text-xs", statusBadgeClass[status])}>
               {status.toUpperCase()}
             </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0"> {/* Reduced padding top */}
        {/* Potential for more actions or details here if needed */}
      </CardFooter>
    </Card>
  );
};

export default UseCaseCard;
