'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/lib/auth-helpers';
import { User, Settings, Users, LogOut, CreditCard } from 'lucide-react';

export default function UserMenu() {
  const router = useRouter();
  const { user, isReady } = useAuthReady();
  const [userName, setUserName] = useState<string>('Usuario');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    if (isReady && user) {
      setUserEmail(user.email || '');
      // Try to get user metadata
      const metadata = user.user_metadata;
      if (metadata?.name) {
        setUserName(metadata.name);
      } else if (user.email) {
        setUserName(user.email.split('@')[0]);
      }
    }
  }, [user, isReady]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <Avatar className="h-9 w-9 bg-blue-500 text-white">
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 py-2">
            <p className="text-sm font-semibold text-foreground">
              {userName || 'Usuario'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail || 'sin email'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Perfil y Configuración */}
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Equipo y Membresía */}
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings/members')} className="cursor-pointer">
          <Users className="mr-2 h-4 w-4" />
          <span>Gestionar Equipo</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings/organization')} className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Plan y Membresía</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}