import { formatCnic, stripNonDigits } from "../utils/formatters";

// Controlled input for NADRA CNIC numbers. `value`/`onChange` always deal in
// raw digits (never formatted) so parent state is exactly what gets
// submitted to the API — the "12345-1234567-1" mask is a display-only
// concern handled entirely inside this component.
const CnicInput = ({ value, onChange, placeholder = "12345-1234567-1", className, ...rest }) => (
  <input
    type="text"
    inputMode="numeric"
    value={formatCnic(value)}
    onChange={(e) => onChange(stripNonDigits(e.target.value).slice(0, 13))}
    placeholder={placeholder}
    className={className}
    {...rest}
  />
);

export default CnicInput;
