import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import scissorsImg from "../../assets/Icons/scissors.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Invalid credentials or server error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-[#0f201c] font-body">
      <div className="w-full max-w-[960px] rounded-[18px] overflow-hidden flex min-h-[560px] shadow-[0_12px_40px_-16px_rgba(0,0,0,.5),_0_2px_8px_rgba(0,0,0,.2)]">
        {/* ── Brand panel (desktop only) ── */}
        <div className="hidden md:flex w-[45%] relative bg-[#0b1714] text-[#f2ece1] flex-col justify-between overflow-hidden px-[42px] py-[46px]">
          {/* Stitch texture — repeating-gradient, no Tailwind equivalent */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[.16]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,.13) 0 2px, transparent 2px 13px)",
            }}
          />

          {/* Logo */}
          <div className="relative flex items-center gap-[11px]">
            <div className="w-8 h-8 rounded-[9px]  text-[#0c1a17] flex items-center justify-center text-lg shrink-0 overflow-hidden">
              <img
                src={scissorsImg}
                alt="Scissors icon"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-headline font-semibold text-base tracking-[-0.01em]">
              Digital Tailor
            </span>
          </div>

          {/* Tagline */}
          <div className="relative">
            <p className="font-headline font-semibold text-[11px] tracking-[.14em] uppercase text-[#d6a35c] mb-4">
              Welcome back to your workshop.
            </p>
            <h2 className="font-newsreader font-normal text-[30px] leading-[1.22] tracking-[-0.01em] text-[#f2ece1] mb-[26px]">
              Every stitch, order, and customer is waiting for you.
            </h2>
            <div className="flex items-center">
              <span className="text-[#d6a35c] text-xl leading-none">✂</span>
              <div className="flex-1 border-t-2 border-dashed border-[#d6a35c]/40 ml-1" />
            </div>
          </div>

          {/* Footer */}
          <p className="relative font-body font-medium text-xs text-[#f2ece1]/50 tracking-[.01em]">
            Owner &amp; admin sign-in · one workspace per business
          </p>
        </div>

        {/* ── Form panel ── */}
        <div className="w-full md:w-[55%] bg-[#faf6ef] flex flex-col justify-center px-[52px] py-12">
          <h1 className="font-newsreader font-semibold text-[25px] leading-[1.15] tracking-[-0.01em] text-[#1f3a32] mb-1.5">
            Welcome back
          </h1>
          <p className="font-body font-medium text-[13.5px] leading-relaxed text-[#8a8178] mb-7">
            Sign in to your business.
          </p>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-[7px]">
              <span className="font-headline font-semibold text-[11px] tracking-[.07em] uppercase text-[#9b9289]">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full font-body font-medium text-[14.5px] text-[#2a2521] px-[14px] py-3 border-[1.5px] border-[#e7e0d6] rounded-[11px] bg-[#fbf9f5] outline-none transition-all placeholder:text-[#b4ab9f] focus:border-[#c06b4a] focus:ring-[3px] focus:ring-[#c06b4a]/[.14] focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[7px]">
              <span className="font-headline font-semibold text-[11px] tracking-[.07em] uppercase text-[#9b9289]">
                Password
              </span>
              <div className="flex items-stretch border-[1.5px] border-[#e7e0d6] rounded-[11px] bg-[#fbf9f5] overflow-hidden transition-all focus-within:border-[#c06b4a] focus-within:ring-[3px] focus-within:ring-[#c06b4a]/[.14] focus-within:bg-white">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="flex-1 font-body font-medium text-[14.5px] text-[#2a2521] px-[14px] py-3 bg-transparent outline-none placeholder:text-[#b4ab9f]"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="flex items-center px-[13px] text-[#b4ab9f] border-l-[1.5px] border-[#ece5db] bg-transparent outline-none cursor-pointer transition-colors hover:text-[#c06b4a]"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isPasswordVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-1 border-0 rounded-[12px] py-[14px] font-headline font-bold text-[15px] text-[#0c1a17] bg-[#d6a35c] cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-[1.06] active:translate-y-px"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            {/* Create account link */}
            <p className="text-center font-body font-medium text-[13px] text-[#9b9289]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[#c06b4a] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
