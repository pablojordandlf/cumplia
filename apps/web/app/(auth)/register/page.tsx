import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Crear Cuenta - Registro Gratis",
  description: "Regístrate gratis en CumplIA y comienza a evaluar el cumplimiento del AI Act de tus sistemas de inteligencia artificial. Sin tarjeta de crédito.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://cumplia.com/register",
  },
  openGraph: {
    title: "Crear Cuenta Gratis - CumplIA",
    description: "Empieza a cumplir con el AI Act hoy mismo. Registro gratuito sin compromiso.",
    url: "https://cumplia.com/register",
    type: "website",
  },
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <RegisterForm />
    </div>
  );
}
