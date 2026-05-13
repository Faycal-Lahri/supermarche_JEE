/**
 * Composant FormGroup accessible
 * Remplace les inputs mal structurés avec labels et ARIA
 */
export const FormGroup = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  helperText,
  disabled,
  pattern,
  ...props
}) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: error ? '#FF453A' : '#6E6E73',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            transition: 'color 150ms ease'
          }}
        >
          {label}
          {required && <span style={{ color: '#FF453A', marginLeft: 4 }}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        pattern={pattern}
        className="apple-input"
        aria-label={label}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error || helperText ? `${inputId}-help` : undefined}
        style={{
          background: '#F5F5F7',
          border: error ? '1.5px solid #FF453A' : 'none',
          width: '100%'
        }}
        {...props}
      />

      {error && (
        <span
          id={`${inputId}-help`}
          style={{ fontSize: 12, color: '#FF453A', animation: 'shake 400ms ease' }}
          role="alert"
        >
          ⚠️ {error}
        </span>
      )}

      {helperText && !error && (
        <span
          id={`${inputId}-help`}
          style={{ fontSize: 12, color: '#8E8E93' }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

/**
 * Composant Button accessible avec ripple effect
 */
export const Button = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  type = 'button',
  ariaLabel,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: {
      background: '#0071E3',
      color: '#fff',
      boxShadow: '0 4px 16px rgba(0,113,227,0.25)'
    },
    secondary: {
      background: '#F5F5F7',
      color: '#1D1D1F',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    danger: {
      background: '#FF453A',
      color: '#fff',
      boxShadow: '0 4px 16px rgba(255,69,58,0.25)'
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 44,
        padding: '0 24px',
        borderRadius: 9999,
        border: 'none',
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms cubic-bezier(0.25,0.46,0.45,0.94)',
        position: 'relative',
        overflow: 'hidden',
        ...variantStyles[variant]
      }}
      className={`btn-ripple ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Composant Checkbox accessible
 */
export const Checkbox = ({ id, label, checked, onChange, disabled, ariaLabel, ...props }) => {
  const checkboxId = id || `checkbox-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel || label}
        style={{
          width: 18,
          height: 18,
          accentColor: '#0071E3',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        {...props}
      />
      {label && (
        <span style={{ fontSize: 14, color: '#1D1D1F', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </label>
  );
};

/**
 * Composant Radio Group accessible
 */
export const RadioGroup = ({ label, options, value, onChange, disabled, ariaLabel }) => {
  return (
    <fieldset style={{ border: 'none', padding: 0 }}>
      {label && (
        <legend style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#6E6E73',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 12
        }}>
          {label}
        </legend>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} role="radiogroup">
        {options.map(option => (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1
            }}
          >
            <input
              type="radio"
              name={ariaLabel || label}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              style={{
                width: 18,
                height: 18,
                accentColor: '#0071E3',
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            />
            <span style={{ fontSize: 14, color: '#1D1D1F', fontWeight: 500 }}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
