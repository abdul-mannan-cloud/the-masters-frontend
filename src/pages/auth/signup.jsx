import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import scissorsImg from "../../assets/Icons/scissors.png";
import PhoneInput from "../../components/PhoneInput";
import Spinner from "../../components/Spinner";
import { isValidPhone } from "../../utils/formatters";
import AuthField from "./AuthField";

const CreateAccount = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    if (!businessName.trim()) next.businessName = "Business name is required.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Must be at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (contactPhone && !isValidPhone(contactPhone)) {
      next.contactPhone = "Enter a valid 11-digit mobile number starting with 03.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signup({ email, password, businessName, contactPhone, address, logo });
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-secondary font-body">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-6xl rounded-3xl overflow-hidden flex min-h-140 shadow-[0_20px_60px_-16px_rgba(0,0,0,.45),0_2px_8px_rgba(0,0,0,.18)]"
      >
        {/* Brand panel (desktop only) */}
        <div className="hidden md:flex w-[45%] relative bg-linear-to-br from-secondary to-[#241f1a] text-on-secondary flex-col justify-between overflow-hidden px-11 py-12">
          <div
            className="absolute inset-0 pointer-events-none opacity-[.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,.9) 0 2px, transparent 2px 13px)",
            }}
          />
          <div
            className="absolute -right-24 -bottom-24 w-96 h-96 pointer-events-none rounded-full opacity-[.10]"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(255,255,255,.9) 0deg 2deg, transparent 2deg 8deg)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              <img src={scissorsImg} alt="Scissors icon" className="w-full h-full object-cover" />
            </div>
            <span className="font-headline font-semibold text-base tracking-tight">
              Digital Tailor
            </span>
          </div>

          <div className="relative">
            <p className="font-headline font-semibold text-[11px] tracking-[.14em] uppercase text-primary mb-4">
              Create your account.
            </p>
            <h2 className="font-newsreader font-normal text-3xl leading-[1.22] tracking-tight mb-6">
              Start managing orders, employees, and clients with ease.
            </h2>
            <div className="flex items-center">
              <span className="text-primary text-xl leading-none">✂</span>
              <div className="flex-1 border-t-2 border-dashed border-primary/40 ml-1" />
            </div>
          </div>

          <p className="relative font-body font-medium text-xs text-on-secondary/50 tracking-wide">
            Owner &amp; admin registration · one workspace per business
          </p>
        </div>

        {/* Form panel */}
        <div className="w-full md:w-[55%] bg-background flex flex-col justify-center px-10 sm:px-14 py-12 max-h-screen overflow-y-auto">
          <h1 className="font-newsreader font-semibold text-[26px] leading-tight tracking-tight text-on-background mb-1.5">
            Create an account
          </h1>
          <p className="font-body font-medium text-sm leading-relaxed text-on-surface-variant mb-7">
            Register your atelier workspace.
          </p>

          <div className="flex flex-col gap-4">
            <AuthField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              error={errors.email}
            />

            <AuthField
              label="Business Name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onKeyDown={handleKeyDown}
              error={errors.businessName}
            />

            {/* Logo — a file input rather than the floating-label text pattern */}
            <div className="flex flex-col gap-1.5">
              <span className="font-headline font-semibold text-[11px] tracking-wider uppercase text-on-surface-variant">
                Business Logo (optional)
              </span>
              <div className="flex items-center gap-3">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="flex-1 font-body font-medium text-[13px] text-on-surface file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-stone-200 file:text-on-surface file:text-xs file:font-semibold file:cursor-pointer cursor-pointer"
                />
              </div>
            </div>

            <AuthField
              label="Contact Phone (optional)"
              as={PhoneInput}
              value={contactPhone}
              onChange={setContactPhone}
              onKeyDown={handleKeyDown}
              placeholder=""
              error={errors.contactPhone}
            />

            <AuthField
              label="Address (optional)"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <AuthField
              label="Password"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              error={errors.password}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  className="absolute right-1 top-1 bottom-1 px-3 flex items-center text-stone-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isPasswordVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              }
            />

            <AuthField
              label="Confirm Password"
              type={isConfirmVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              error={errors.confirmPassword}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setIsConfirmVisible((v) => !v)}
                  className="absolute right-1 top-1 bottom-1 px-3 flex items-center text-stone-400 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isConfirmVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              }
            />

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-1 border-0 rounded-2xl py-3.5 font-headline font-bold text-[15px] text-on-primary bg-primary flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary-container"
            >
              {loading && <Spinner size="sm" tone="on-primary" />}
              {loading ? "Creating account…" : "Create account"}
            </motion.button>

            <p className="text-center font-body font-medium text-[13px] text-on-surface-variant mt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAccount;
