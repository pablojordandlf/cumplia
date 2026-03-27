import React from 'react';
import { NavigationBar } from '@/components/NavigationBar';
import { Footer } from '@/components/Footer';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}