"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface PricingCardProps {
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  ctaText: string;
  popular?: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}

export function PricingCard({
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  ctaText,
  popular = false,
  stripePriceIdMonthly,
  stripePriceIdYearly,
}: PricingCardProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const price = isYearly ? yearlyPrice : monthlyPrice;
  const stripePriceId = isYearly ? stripePriceIdYearly : stripePriceIdMonthly;
  const isFree = monthlyPrice === 0 && yearlyPrice === 0;
  const isEnterprise = name.toLowerCase() === "enterprise";

  const handleSubscribe = async () => {
    if (isFree) {
      // Redirect to signup for free plan
      window.location.href = "/auth/signup?plan=free";
      return;
    }

    if (isEnterprise) {
      // Redirect to contact sales
      window.location.href = "mailto:enterprise@cumplia.com";
      return;
    }

    if (!stripePriceId) {
      console.error("No stripe price ID configured");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: stripePriceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`relative flex flex-col ${popular ? "border-primary shadow-lg md:scale-105" : ""} dark:bg-gray-900`}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
          Más Popular
        </Badge>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        <CardDescription className="mt-4">
          {!isEnterprise && !isFree && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`text-sm ${!isYearly ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Mensual
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={`text-sm ${isYearly ? "text-primary font-medium" : "text-muted-foreground"}`}>
                Anual
              </span>
            </div>
          )}
          <div>
            {isFree ? (
              <span className="text-4xl font-bold">Gratis</span>
            ) : isEnterprise ? (
              <span className="text-3xl font-bold">Personalizado</span>
            ) : (
              <>
                <span className="text-4xl font-bold">{price}€</span>
                <span className="text-muted-foreground">/{isYearly ? "año" : "mes"}</span>
              </>
            )}
          </div>
          {!isEnterprise && !isFree && isYearly && (
            <p className="text-sm text-green-600 mt-1">
              Ahorra {Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100)}%
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={handleSubscribe}
          disabled={isLoading}
          variant={popular ? "default" : "outline"}
          className="w-full"
        >
          {isLoading ? "Cargando..." : ctaText}
        </Button>
      </CardContent>
    </Card>
  );
}
