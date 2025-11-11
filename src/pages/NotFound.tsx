import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-10 w-12 h-12 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-400 animate-fade-in leading-none">
            404
          </h1>
          <div className="absolute inset-0 text-9xl md:text-[12rem] font-black text-green-500/10 animate-pulse">
            404
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 animate-fade-in delay-300">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
              The page you're looking for seems to have vanished into the
              digital void. Let's get you back on track!
            </p>
          </div>

          {/* Current path display */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mx-auto max-w-md">
            <p className="text-sm text-slate-400 mb-1">Attempted to access:</p>
            <code className="text-green-400 text-sm font-mono bg-slate-900/50 px-2 py-1 rounded">
              {location.pathname}
            </code>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 min-w-[180px]"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-slate-600 text-slate-300 bg-slate-800  px-8 py-3 rounded-xl font-semibold transition-all duration-300 min-w-[180px]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional help */}
          <div className="pt-8 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <button
                onClick={() => navigate("/services")}
                className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Services
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => navigate("/profile")}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Profile
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => navigate("/contact-us")}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
