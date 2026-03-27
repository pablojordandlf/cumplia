'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RiskSummaryCardProps {
  completionRate: number;
  completedObligations: number;
  totalApplicableObligations: number;
}

/**
 * Risk Summary Card
 * Displays ONE KPI: completion percentage
 * Progressive disclosure - minimal, focused design
 */
export function RiskSummaryCard({
  completionRate,
  completedObligations,
  totalApplicableObligations,
}: RiskSummaryCardProps) {
  return (
    <Card className="bg-gradient-to-br from-[#E09E50] to-[#D9885F] text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5" />
          Cumplimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Single KPI - Completion Rate */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-5xl font-bold mb-2"
          >
            {completionRate}%
          </motion.div>
          <p className="text-[#E09E50]/80 text-sm">Obligaciones cumplidas</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress
            value={completionRate}
            indicatorVariant={
              completionRate === 100
                ? 'success'
                : completionRate >= 50
                  ? 'gradient'
                  : 'blue'
            }
            trackVariant="blue"
            className="h-3 bg-[#E09E50]/40"
          />
        </div>

        {/* Details (hidden by default, shown on click via expandable) */}
        <div className="pt-4 border-t border-[#E09E50]/40 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#E09E50]/80">Completadas</span>
            <span className="font-semibold">{completedObligations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#E09E50]/80">Total</span>
            <span className="font-semibold">{totalApplicableObligations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#E09E50]/80">Pendientes</span>
            <span className="font-semibold">
              {totalApplicableObligations - completedObligations}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 pt-6 border-t border-[#E09E50]/40">
          <Link href="/dashboard/inventory">
            <Button variant="secondary" className="w-full bg-white hover:bg-[#E8ECEB] text-[#E09E50] transition-colors">
              Ver inventario
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
