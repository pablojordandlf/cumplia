import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface OrgSwitcherProps {
  organizations: Array<{ id: string; name: string }>;
  currentOrgId: string;
  onSwitch: (orgId: string) => void;
}

export function OrgSwitcher({ organizations, currentOrgId, onSwitch }: OrgSwitcherProps) {
  const currentOrg = organizations.find(org => org.id === currentOrgId);

  if (!currentOrg) {
    return null; // Or render a fallback/error state
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentOrg.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => onSwitch(org.id)}
            className={`cursor-pointer ${org.id === currentOrgId ? 'bg-primary/10' : ''}`}
          >
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
