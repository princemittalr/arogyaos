import React, { useState, forwardRef, useId } from 'react';
import { icons } from '@/design-system/icons';
import { EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  loading?: boolean;
  onClear?: () => void;
  floatingLabel?: string;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      success,
      warning,
      prefixIcon,
      suffixIcon,
      loading,
      onClear,
      floatingLabel,
      helperText,
      errorText,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const id = providedId || internalId;

    const baseInput = cn(
      "flex h-[44px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-base shadow-sm transition-colors",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-slate-500 dark:placeholder:text-slate-400",
      "focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20",
      "hover:border-slate-300 dark:hover:border-slate-600",
      "disabled:cursor-not-allowed disabled:opacity-50",
      {
        "border-red-500 hover:border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20": error,
        "border-amber-500 hover:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/20": warning,
        "border-emerald-500 hover:border-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20": success,
        "ps-10": !!prefixIcon,
        "pe-10": !!suffixIcon || loading || onClear || error || success,
      },
      className
    );

    const hasAdornment = prefixIcon || suffixIcon || loading || onClear || error || success;

    return (
      <div className="w-full space-y-1.5">
        {floatingLabel && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
          >
            {floatingLabel}
          </label>
        )}
        
        {hasAdornment ? (
          <div className="relative">
            {prefixIcon && (
              <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center pointer-events-none">
                {prefixIcon}
              </div>
            )}
            
            <input
              type={type}
              className={baseInput}
              ref={ref}
              id={id}
              disabled={disabled}
              {...props}
            />
            
            <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {loading && <icons.Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
              {!loading && onClear && props.value && !disabled && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus-visible:outline-none"
                >
                  <icons.X className="w-4 h-4" />
                </button>
              )}
              {!loading && suffixIcon && (
                <div className="text-slate-500 flex items-center justify-center">
                  {suffixIcon}
                </div>
              )}
              {error && !loading && <icons.AlertCircle className="w-4 h-4 text-red-500" />}
              {success && !loading && <icons.CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
          </div>
        ) : (
          <input
            type={type}
            className={baseInput}
            ref={ref}
            id={id}
            disabled={disabled}
            {...props}
          />
        )}
        
        {helperText && !errorText && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
        
        {errorText && (
          <p className="text-[13px] font-medium text-red-500">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <Input
      ref={ref}
      type={show ? 'text' : 'password'}
      suffixIcon={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus-visible:outline-none flex items-center justify-center"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <icons.Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = 'PasswordInput';

export const SearchInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      type="search"
      prefixIcon={<icons.Search className="w-4 h-4" />}
      {...props}
    />
  );
});
SearchInput.displayName = 'SearchInput';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean; success?: boolean; floatingLabel?: string; errorText?: string; helperText?: string }>(
  ({ className, error, success, floatingLabel, errorText, helperText, disabled, id: providedId, ...props }, ref) => {
    const internalId = useId();
    const id = providedId || internalId;

    return (
      <div className="w-full space-y-1.5">
        {floatingLabel && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
          >
            {floatingLabel}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-base shadow-sm transition-colors",
            "placeholder:text-slate-500 dark:placeholder:text-slate-400",
            "focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20",
            "hover:border-slate-300 dark:hover:border-slate-600",
            "disabled:cursor-not-allowed disabled:opacity-50",
            {
              "border-red-500 hover:border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20": error,
              "border-emerald-500 hover:border-emerald-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20": success,
            },
            className
          )}
          {...props}
        />
        {helperText && !errorText && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
        {errorText && (
          <p className="text-[13px] font-medium text-red-500">
            {errorText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
