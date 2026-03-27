'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

interface FetchResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook para esperar a que la autenticación esté lista
 * Resuelve el problema de race condition donde getUser() devuelve null inicialmente
 */
export function useAuthReady(maxWaitMs = 5000): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isReady: false,
    error: null,
  });

  useEffect(() => {
    let isResolved = false;
    const resolveAuth = (user: any | null, error: string | null = null) => {
      if (!isResolved) {
        isResolved = true;
        setState({
          user,
          isLoading: false,
          isReady: true,
          error,
        });
      }
    };

    // Verificar autenticación inmediatamente
    const checkAuthImmediate = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user) {
        resolveAuth(user);
        return;
      }

      if (error) {
        // Verificar sesión si getUser falló
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          resolveAuth(session.user);
          return;
        }
        resolveAuth(null, error.message);
        return;
      }

      // Si no hay usuario, verificar sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        resolveAuth(session.user);
        return;
      }

      // Si llegamos aquí y no hay sesión, esperar un poco más
      return false;
    };

    checkAuthImmediate().then((resolved) => {
      if (resolved === false) {
        // No resuelto inmediatamente, usar polling
        const checkInterval = setInterval(async () => {
          if (isResolved) {
            clearInterval(checkInterval);
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            clearInterval(checkInterval);
            resolveAuth(session.user);
          }
        }, 100);

        // Timeout de seguridad
        const timeout = setTimeout(() => {
          clearInterval(checkInterval);
          resolveAuth(null);
        }, maxWaitMs);

        return () => {
          clearInterval(checkInterval);
          clearTimeout(timeout);
        };
      }
    });

    // También escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        resolveAuth(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [maxWaitMs]);

  return state;
}

/**
 * Función para obtener la organización del usuario actual con reintentos
 * Maneja el error PGRST116 (no rows returned) de forma graceful
 * 
 * NOTA: Usa consultas separadas para evitar problemas de relación ambigua
 * entre organization_members y organizations
 */
export async function fetchUserOrganization(maxRetries = 3, retryDelay = 500) {
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Esperar un poco y reintentar
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
        return { data: null, error: 'No hay sesión activa' };
      }

      // PASO 1: Obtener membresía sin join
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberError) {
        // PGRST116 = no rows returned, no es un error grave
        if (memberError.code === 'PGRST116') {
          return { data: null, error: 'No se encontró membresía activa en ninguna organización' };
        }
        
        // Otros errores pueden ser transitorios, reintentar
        lastError = memberError;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
        
        return { data: null, error: memberError.message };
      }

      if (!memberData) {
        return { data: null, error: 'No se encontró membresía activa' };
      }

      // PASO 2: Obtener datos de la organización por separado
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, plan_name, seats_total, seats_used')
        .eq('id', memberData.organization_id)
        .single();

      if (orgError || !orgData) {
        return { data: null, error: 'No se encontró la información de la organización' };
      }

      return {
        data: {
          organizationId: memberData.organization_id,
          role: memberData.role,
          organization: {
            id: orgData.id,
            name: orgData.name || 'Sin nombre',
            plan_name: orgData.plan_name || 'free',
            seats_total: orgData.seats_total || 1,
            seats_used: orgData.seats_used || 0,
            max_users: orgData.seats_total || 1,
          }
        },
        error: null
      };

    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  return { data: null, error: lastError?.message || 'Error desconocido' };
}

/**
 * Hook para usar fetchUserOrganization con estado de React
 */
export function useUserOrganization() {
  const [result, setResult] = useState<FetchResult<any>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setResult(prev => ({ ...prev, isLoading: true, error: null }));
    const { data, error } = await fetchUserOrganization();
    setResult({ data, error, isLoading: false });
    return { data, error };
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...result, refetch: fetchData };
}
