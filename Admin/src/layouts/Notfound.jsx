import { useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    setIsVisible(true);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto redirect after 10 seconds - using replace to prevent going back to 404
    const redirectTimer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 10000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const quickLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Customers",
      path: "/users",
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Bookings",
      path: "/bookings",
      icon: Calendar,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Packages",
      path: "/package",
      icon: Package,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#5472D3] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className={`max-w-5xl w-full transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <img
                src="/airbound.png"
                width={50}
                height={50}
                alt="Airbound"
                className="drop-shadow-lg"
              />
              <h1 className="text-2xl font-bold text-white">Airbound</h1>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Image & Animation */}
              <div className="relative bg-gradient-to-br from-[#0D47A1] to-[#5472D3] p-12 flex items-center justify-center">
                <div className="relative">
                  {/* Animated Rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-white/20 rounded-full animate-ping-slow"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-white/30 rounded-full animate-ping-slower"></div>
                  </div>

                  {/* Center Content */}
                  <div className="relative z-10 text-center">
                    <div className="mb-6">
                      <h2 className="text-[120px] md:text-[150px] font-black text-white leading-none animate-bounce-subtle">
                        404
                      </h2>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block">
                      <p className="text-white text-lg font-semibold">
                        Page Not Found
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#0D47A1] to-[#5472D3] rounded-2xl shadow-lg animate-bounce-subtle">
                    <TrendingUp size={32} className="text-white" />
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-[#1A1D25] mb-4">
                      Oops! Lost Your Way?
                    </h3>
                    <p className="text-[#6B7280] text-lg leading-relaxed">
                      The page you're looking for seems to have taken an
                      unexpected workout break. Let's get you back on track to
                      your fitness management dashboard.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[#5472D3] text-[#5472D3] rounded-xl font-semibold transition-all duration-300 hover:bg-[#5472D3] hover:text-white hover:shadow-lg hover:scale-105 transform"
                    >
                      <ArrowLeft size={20} />
                      Go Back
                    </button>
                    <button
                      onClick={() => navigate("/dashboard", { replace: true })}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white rounded-xl font-semibold shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
                    >
                      <Home size={20} />
                      Dashboard {countdown > 0 && `(${countdown}s)`}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-[#E5E7EB]"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm font-medium text-[#6B7280]">
                        Quick Navigation
                      </span>
                    </div>
                  </div>

                  {/* Quick Links Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {quickLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.name}
                          onClick={() => navigate(link.path, { replace: true })}
                          className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-transparent transform"
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                          ></div>
                          <div className="relative flex flex-col items-center gap-2">
                            <div className="p-2 bg-white/50 backdrop-blur-sm rounded-lg group-hover:bg-white/20 transition-all duration-300">
                              <Icon
                                size={24}
                                className={`text-[#5472D3] group-hover:text-white transition-colors duration-300`}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#1A1D25] group-hover:text-white transition-colors duration-300">
                              {link.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in-delayed">
            <p className="text-white/80 text-sm">
              Need assistance? Contact support at{" "}
              <a
                href="mailto:airbound@gmail.com"
                className="font-semibold hover:underline text-white"
              >
                airbound@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.3s forwards;
          opacity: 0;
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}
