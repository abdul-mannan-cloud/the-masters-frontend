import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import scissorsImg from "../../assets/Icons/scissors.png";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || !confirmPassword || !businessName) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await signup({ email, password, businessName });
      toast.success("Account created successfully");
      navigate("/login");
    } catch (error) {
      const message =
        error?.response?.data?.error || "Failed to create account";
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
      <div className="w-full max-w-240 rounded-[18px] overflow-hidden flex min-h-140 shadow-[0_12px_40px_-16px_rgba(0,0,0,.5),0_2px_8px_rgba(0,0,0,.2)]">
        {/* ── Brand panel (desktop only) ── */}
        <div className="hidden md:flex w-[45%] relative bg-[#0b1714] text-[#f2ece1] flex-col justify-between overflow-hidden px-10.5 py-11.5">
          <div
            className="absolute inset-0 pointer-events-none opacity-[.16]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,.13) 0 2px, transparent 2px 13px)",
            }}
          />

          {/* Logo */}
          <div className="relative flex items-center gap-2.75">
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
              Create your account.
            </p>
            <h2 className="font-newsreader font-normal text-[30px] leading-[1.22] tracking-[-0.01em] text-[#f2ece1] mb-6.5">
              Start managing orders, employees, and clients with ease.{" "}
            </h2>
            <div className="flex items-center">
              <span className="text-[#d6a35c] text-xl leading-none">✂</span>
              <div className="flex-1 border-t-2 border-dashed border-[#d6a35c]/40 ml-1" />
            </div>
          </div>

          {/* Footer */}
          <p className="relative font-body font-medium text-xs text-[#f2ece1]/50 tracking-[.01em]">
            Owner &amp; admin registration · one workspace per business
          </p>
        </div>

        {/* ── Form panel ── */}
        <div className="w-full md:w-[55%] bg-[#faf6ef] flex flex-col justify-center px-13 py-12">
          <h1 className="font-newsreader font-semibold text-[25px] leading-[1.15] tracking-[-0.01em] text-[#1f3a32] mb-1.5">
            Create an account
          </h1>
          <p className="font-body font-medium text-[13.5px] leading-relaxed text-[#8a8178] mb-7">
            Register your atelier workspace.
          </p>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.75">
              <span className="font-headline font-semibold text-[11px] tracking-[.07em] uppercase text-[#9b9289]">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className="w-full font-body font-medium text-[14.5px] text-[#2a2521] px-3.5 py-3 border-[1.5px] border-[#e7e0d6] rounded-[11px] bg-[#fbf9f5] outline-none transition-all placeholder:text-[#b4ab9f] focus:border-[#c06b4a] focus:ring-[3px] focus:ring-[#c06b4a]/[.14] focus:bg-white"
              />
            </div>

            {/* Business Name */}
            <div className="flex flex-col gap-1.75">
              <span className="font-headline font-semibold text-[11px] tracking-[.07em] uppercase text-[#9b9289]">
                Business Name
              </span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your business name"
                className="w-full font-body font-medium text-[14.5px] text-[#2a2521] px-3.5 py-3 border-[1.5px] border-[#e7e0d6] rounded-[11px] bg-[#fbf9f5] outline-none transition-all placeholder:text-[#b4ab9f] focus:border-[#c06b4a] focus:ring-[3px] focus:ring-[#c06b4a]/[.14] focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.75">
              <span className="font-headline font-semibold text-[11px] tracking-[.07em] uppercase text-[#9b9289]">
                Password
              </span>
              <div className="flex items-stretch border-[1.5px] border-[#e7e0d6] rounded-[11px] bg-[#fbf9f5] overflow-hidden transition-all focus-within:border-[#c06b4a] focus-within:ring-[3px] focus-within:ring-[#c06b4a]/[.14] focus-within:bg-white">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Min. 8 characters"
                  className="flex-1 font-body font-medium text-[14.5px] text-[#2a2521] px-3.5 py-3 bg-transparent outline-none placeholder:text-[#b4ab9f]"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="flex items-center px-3.25 text-[#b4ab9f] border-l-[1.5px] border-[#ece5db] bg-transparent outline-none cursor-pointer transition-colors hover:text-[#c06b4a]"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isPasswordVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.75">
              <span className="font-headline font-semibold text-[11px] tracking-[.07em] uppercase text-[#9b9289]">
                Confirm Password
              </span>
              <div className="flex items-stretch border-[1.5px] border-[#e7e0d6] rounded-[11px] bg-[#fbf9f5] overflow-hidden transition-all focus-within:border-[#c06b4a] focus-within:ring-[3px] focus-within:ring-[#c06b4a]/[.14] focus-within:bg-white">
                <input
                  type={isConfirmVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="flex-1 font-body font-medium text-[14.5px] text-[#2a2521] px-3.5 py-3 bg-transparent outline-none placeholder:text-[#b4ab9f]"
                />
                <button
                  type="button"
                  onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                  className="flex items-center px-3.25 text-[#b4ab9f] border-l-[1.5px] border-[#ece5db] bg-transparent outline-none cursor-pointer transition-colors hover:text-[#c06b4a]"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isConfirmVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-1 border-0 rounded-xl py-3.5 font-headline font-bold text-[15px] text-[#0c1a17] bg-[#d6a35c] cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-[1.06] active:translate-y-px"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            {/* Back to login */}
            <p className="text-center font-body font-medium text-[13px] text-[#9b9289] mt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#c06b4a] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
