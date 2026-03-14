import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta de CumplIA para gestionar el cumplimiento del AI Act de tus sistemas de inteligencia artificial.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://cumplia.com/login",
  },
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <LoginForm />
    </div>
  );
}
