'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileWarning, FormInput, Settings2, ArrowLeft } from 'lucide-react';
import { RiskTemplatesPanel } from './components/risk-templates-panel';
import { CustomFieldsPanel } from './components/custom-fields-panel';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('risk-templates');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Administración</h1>
            <p className="text-gray-500 mt-1">Gestiona tus plantillas y configuraciones</p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="risk-templates" className="flex items-center gap-2">
            <FileWarning className="w-4 h-4" />
            Plantillas de Riesgos
          </TabsTrigger>
          <TabsTrigger value="custom-fields" className="flex items-center gap-2">
            <FormInput className="w-4 h-4" />
            Campos Adicionales
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk-templates" className="mt-6">
          <RiskTemplatesPanel />
        </TabsContent>
        
        <TabsContent value="custom-fields" className="mt-6">
          <CustomFieldsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}