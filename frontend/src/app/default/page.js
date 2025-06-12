import Image from "next/image";
import LoginForm from "../../components/auth/LoginForm";

export default function Hello() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            className="mx-auto mb-4"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GLOW by Microsofties</h1>
          <p className="text-lg text-gray-600">Full-Stack MVC Web Application</p>
        </div>

        {/* MVC Architecture Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">MVC Architecture Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">M</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Model</h3>
              <p className="text-sm text-gray-600">
                User.js - MongoDB schema with Mongoose, handles data structure and validation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">V</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">View</h3>
              <p className="text-sm text-gray-600">
                Next.js frontend components and API routes for presentation layer
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">C</span>
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Controller</h3>
              <p className="text-sm text-gray-600">
                UserController.js - Business logic, handles requests and responses
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Frontend: Next.js running on port 3000</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Backend: Express.js configured for port 5000</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Database: MongoDB connection configured</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Start the backend server to test the full MVC connectivity
          </p>
        </div>

        {/* Login Demo */}
        <LoginForm />

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">1. Start Backend:</h3>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                cd glow-microsofties/backend && npm run dev
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">2. Start Frontend:</h3>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                cd my-mvc-app && npm run dev
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">3. Test Connection:</h3>
              <p className="text-sm text-gray-600">
                Use the login form above to test frontend-backend connectivity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
