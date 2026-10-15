import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { AdminLogin } from "../Apis/ApiCalls";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail) {
      setUser((prev) => ({
        ...prev,
        email: savedEmail,
        password: savedPassword || "",
      }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await AdminLogin(user);
      if (res.status !== 200) {
        toast.error("Invalid email or password");
        setLoading(false);
        return;
      }

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", user.email);
        localStorage.setItem("rememberedPassword", user.password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      localStorage.setItem("token", res?.token);
      toast.success("Login successful! Redirecting...");

      // Short delay to show success message
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Centered Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Banner (Hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                alt="Modern Office"
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E1045]/95 via-[#3B1E82]/90 to-[#7C3AED]/85"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
              {/* Logo */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
                  <img src="/airbound.png" alt="logo" className="w-12 h-12" />
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center max-w-lg">
                <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                  Aerial360 Admin Portal
                </h1>
                <p className="text-white/90 text-lg xl:text-xl leading-relaxed mb-12">
                  Manage bookings, users, services, and analytics from a single
                  dashboard. Streamline your operations with powerful tools
                  designed for efficiency.
                </p>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-3 gap-6 xl:gap-8 max-w-2xl w-full">
                <div className="text-center">
                  <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20 shadow-lg">
                    <svg
                      className="w-7 h-7 xl:w-8 xl:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm xl:text-base font-semibold text-white">
                    Real-time
                  </p>
                  <p className="text-xs xl:text-sm text-white/70 mt-1">
                    Live booking updates
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20 shadow-lg">
                    <svg
                      className="w-7 h-7 xl:w-8 xl:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm xl:text-base font-semibold text-white">
                    Secure
                  </p>
                  <p className="text-xs xl:text-sm text-white/70 mt-1">
                    Protected access
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20 shadow-lg">
                    <svg
                      className="w-7 h-7 xl:w-8 xl:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm xl:text-base font-semibold text-white">
                    Analytics
                  </p>
                  <p className="text-xs xl:text-sm text-white/70 mt-1">
                    Business insights
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3B1E82] to-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#1A1D25]">
                  Aerial360 Admin
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Management Dashboard
                </p>
              </div>

              {/* Header */}
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-[#1A1D25] mb-2">
                  Sign In
                </h2>
                <p className="text-gray-500">
                  Enter your credentials to access the admin dashboard
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-[#1A1D25] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={user.email}
                      onChange={handleInputChange}
                      required
                      placeholder="admin@example.com"
                      className="block w-full pl-10 pr-3 py-3 border border-[#D8DDE6] rounded-lg text-[#1A1D25] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#5472D3] focus:border-transparent transition duration-200 shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[#1A1D25] mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={user.password}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-12 py-3 border border-[#D8DDE6] rounded-lg text-[#1A1D25] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#5472D3] focus:border-transparent transition duration-200 shadow-sm"
                    />
                    {user.password && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#0D47A1] transition duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#5472D3] bg-white border-[#D8DDE6] rounded focus:ring-2 focus:ring-[#5472D3] focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-600 group-hover:text-[#1A1D25] transition duration-200">
                      Remember me
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-gradient-to-r from-[#3B1E82] to-[#7C3AED] text-white font-semibold py-3.5 rounded-lg hover:from-[#2E1065] hover:to-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
