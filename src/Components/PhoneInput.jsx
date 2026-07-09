import { formatPhone, stripNonDigits } from "../utils/formatters";

// Controlled input for Pakistani mobile numbers. `value`/`onChange` always
// deal in raw digits (never formatted) so parent state is exactly what gets
// submitted to the API — the "0312-1234567" mask is a display-only concern
// handled entirely inside this component.
const PhoneInput = ({ value, onChange, placeholder = "03XX-XXXXXXX", className, ...rest }) => (
  <input
    type="text"
    inputMode="numeric"
    autoComplete="tel"
    value={formatPhone(value)}
    onChange={(e) => onChange(stripNonDigits(e.target.value).slice(0, 11))}
    placeholder={placeholder}
    className={className}
    {...rest}
  />
);

export default PhoneInput;
