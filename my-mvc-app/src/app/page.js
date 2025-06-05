import Image from "next/image";
import LoginForm from "../components/auth/LoginForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GLOW by Microsofties</h1>
          <p className="text-lg text-gray-600">Full-Stack MVC Web Application</p>
        </div>

        {/* Login Demo */}
        <LoginForm />

       
      </div>
    </div>
  );
}
