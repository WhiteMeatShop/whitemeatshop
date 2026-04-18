import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-black mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-wm-gray text-lg">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full bg-white border border-wm-border rounded-xl px-4 py-3 text-base text-black
            placeholder:text-wm-gray/60
            focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-wm-error focus:border-wm-error focus:ring-wm-error/15' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-wm-error mt-1">{error}</p>}
    </div>
  )
);
FormInput.displayName = 'FormInput';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-black mb-1.5">{label}</label>
      )}
      <select
        ref={ref}
        className={`w-full bg-white border border-wm-border rounded-xl px-4 py-3 text-base text-black
          focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15
          transition-all duration-200 appearance-none cursor-pointer
          ${error ? 'border-wm-error focus:border-wm-error focus:ring-wm-error/15' : ''}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-wm-error mt-1">{error}</p>}
    </div>
  )
);
FormSelect.displayName = 'FormSelect';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-black mb-1.5">{label}</label>
      )}
      <textarea
        ref={ref}
        className={`w-full bg-white border border-wm-border rounded-xl px-4 py-3 text-base text-black
          placeholder:text-wm-gray/60
          focus:outline-none focus:border-wm-orange focus:ring-[3px] focus:ring-wm-orange/15
          transition-all duration-200 resize-vertical min-h-[100px]
          ${error ? 'border-wm-error focus:border-wm-error focus:ring-wm-error/15' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-wm-error mt-1">{error}</p>}
    </div>
  )
);
FormTextarea.displayName = 'FormTextarea';

export function ToggleButton({
  options,
  value,
  onChange,
  className = '',
}: {
  options: { value: string; label: string; color?: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex rounded-xl overflow-hidden border border-wm-border ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer
            ${value === opt.value
              ? 'text-white'
              : 'bg-white text-wm-gray hover:text-black'
            }`}
          style={value === opt.value ? { backgroundColor: opt.color ?? '#FF5A00' } : undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
