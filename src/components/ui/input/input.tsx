'use client';

import React, { useState, forwardRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      disabled,
      readOnly,
      placeholder,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const id = providedId || internalId;
    const [isFocused, setIsFocused] = useState(false);

    // Controlled or uncontrolled detection for floating label
    const isFilled =
      (value !== undefined && value !== '' && value !== null) ||
      (defaultValue !== undefined && defaultValue !== '' && defaultValue !== null) ||
      type === 'date' || type === 'time';

    const isFloating = isFocused || isFilled || !!placeholder;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const stateClasses = cn(
      "relative flex items-center w-full transition-all duration-300 rounded-2xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden group shadow-sm",
      {
        "border-slate-200 dark:border-slate-800": !error && !success && !warning && !isFocused,
        "border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-400/20": isFocused && !error && !warning,
        "border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10": error,
        "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10": warning,
        "border-emerald-500 ring-2 ring-emerald-500/20": success,
        "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900": disabled,
      },
      className // Absorb layout/margin classes from the previous implementation
    );

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className={stateClasses}>
          {/* Prefix Icon */}
          {prefixIcon && (
            <div className="pl-3.5 pr-1 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
              {prefixIcon}
            </div>
          )}

          {/* Floating Label Container */}
          <div className="relative flex-1 flex flex-col justify-center px-3.5 py-1 min-h-[46px]">
            {floatingLabel && (
              <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                  y: isFloating ? -12 : 0,
                  scale: isFloating ? 0.75 : 1,
                  color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#94a3b8'
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-3.5 origin-left pointer-events-none whitespace-nowrap font-medium z-10"
              >
                {floatingLabel}
              </motion.label>
            )}

            <input
              ref={ref}
              id={id}
              type={type}
              value={value}
              defaultValue={defaultValue}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={floatingLabel && !isFocused ? '' : placeholder}
              className={cn(
                "w-full bg-transparent outline-none border-none text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 z-20 pt-3 pb-1",
                !floatingLabel && "py-2"
              )}
              {...props}
            />
          </div>

          {/* Suffix Elements */}
          <div className="pr-3 pl-1 flex items-center justify-center gap-2">
            {loading && <icons.Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            {!loading && onClear && isFilled && (
              <button
                type="button"
                onClick={onClear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full p-0.5"
              >
                <icons.X className="w-3.5 h-3.5" />
              </button>
            )}
            {!loading && suffixIcon && (
              <div className="text-slate-400 transition-colors">
                {suffixIcon}
              </div>
            )}
            {error && !loading && <icons.AlertCircle className="w-4 h-4 text-red-500" />}
            {success && !loading && <icons.CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>

          {/* Animated Highlight Line */}
          {isFocused && (
            <motion.div
              layoutId={`input-glow-${id}`}
              className="absolute -bottom-px left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 dark:via-blue-400 z-30"
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.5 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Helper & Error Text */}
        <AnimatePresence mode="wait">
          {(errorText || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className="px-1"
            >
              {errorText ? (
                <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1.5">
                  {errorText}
                </p>
              ) : (
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {helperText}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus-visible:outline-none rounded-sm"
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
  ({ className, error, success, floatingLabel, errorText, helperText, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const internalId = useId();
    const id = props.id || internalId;
    const [isFocused, setIsFocused] = useState(false);

    const isFilled =
      (value !== undefined && value !== '' && value !== null) ||
      (defaultValue !== undefined && defaultValue !== '' && defaultValue !== null);
    
    const isFloating = isFocused || isFilled || !!props.placeholder;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className={cn(
          "relative w-full transition-all duration-300 rounded-2xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-sm",
          {
            "border-slate-200 dark:border-slate-800": !error && !success && !isFocused,
            "border-blue-500 ring-2 ring-blue-500/20": isFocused && !error,
            "border-red-500 ring-2 ring-red-500/20 bg-red-50/50": error,
            "border-emerald-500 ring-2 ring-emerald-500/20": success,
          },
          className
        )}>
          <div className="relative px-3.5 py-2 min-h-[80px]">
            {floatingLabel && (
              <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                  y: isFloating ? -4 : 4,
                  scale: isFloating ? 0.85 : 1,
                  color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#94a3b8'
                }}
                transition={{ duration: 0.2 }}
                className="absolute left-3.5 origin-top-left pointer-events-none font-medium z-10"
              >
                {floatingLabel}
              </motion.label>
            )}
            <textarea
              ref={ref}
              id={id}
              value={value}
              defaultValue={defaultValue}
              onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
              onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
              className={cn(
                "w-full bg-transparent outline-none border-none text-sm font-medium text-slate-900 dark:text-slate-50 placeholder:text-slate-400 resize-y min-h-[60px] z-20",
                floatingLabel && "pt-6"
              )}
              {...props}
            />
          </div>
        </div>
        {/* Helper & Error Text */}
        <AnimatePresence mode="wait">
          {(errorText || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className="px-1"
            >
              {errorText ? (
                <p className="text-[11px] font-semibold text-red-500">{errorText}</p>
              ) : (
                <p className="text-[11px] font-medium text-slate-500">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
