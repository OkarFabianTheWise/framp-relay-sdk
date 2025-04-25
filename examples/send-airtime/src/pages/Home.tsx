import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-12">Welcome to Framp</h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          to="/gift-airtime"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                   transition-colors text-center min-w-[200px]"
        >
          Send Airtime
        </Link>

        <Link
          to="/gift-token"
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
                   transition-colors text-center min-w-[200px]"
        >
          Send Token
        </Link>
      </div>
    </div>
  );
}
