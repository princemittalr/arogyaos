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

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div
          className={cn(
            "group relative flex items-center w-full rounded-lg border bg-white dark:bg-slate-900 transition-shadow duration-200 overflow-hidden shadow-sm",
            {
              "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700": !error && !success && !warning && !isFocused && !disabled,
              "border-blue-500 ring-4 ring-blue-500/15 dark:ring-blue-400/15": isFocused && !error && !warning,
              "border-red-500 ring-4 ring-red-500/15 dark:ring-red-500/15": error,
              "border-amber-500 ring-4 ring-amber-500/15 dark:ring-amber-500/15": warning,
              "border-emerald-500 ring-4 ring-emerald-500/15 dark:ring-emerald-500/15": success,
              "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50": disabled,
            },
            className
          )}
        >
          {/* Prefix Icon */}
          {prefixIcon && (
            <div className="pl-3 pr-2 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
              {prefixIcon}
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex-1 flex flex-col justify-center min-h-[44px]">
            {floatingLabel && (
              <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                  y: isFloating ? -10 : 0,
                  scale: isFloating ? 0.75 : 1,
                  color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#64748b'
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={cn(
                  "absolute origin-top-left pointer-events-none whitespace-nowrap z-10 font-medium",
                  !prefixIcon ? "start-3" : "start-0"
                )}
                style={{ top: '50%', marginTop: '-10px' }}
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
                "w-full bg-transparent outline-none border-none text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 z-20",
                "focus:ring-0 [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset] [&:-webkit-autofill]:text-fill-slate-900 dark:[&:-webkit-autofill]:text-fill-slate-50",
                floatingLabel ? "pt-5 pb-1" : "py-2.5",
                !prefixIcon && "ps-3"
              )}
              {...props}
            />
          </div>

          {/* Suffix Elements */}
          <div className="pr-3 pl-2 flex items-center justify-center gap-1.5">
            {loading && <icons.Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            {!loading && onClear && isFilled && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
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
        </div>

        {/* Helper & Error Text */}
        <AnimatePresence mode="wait">
          {(errorText || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -2, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -2, height: 0 }}
              className="px-1"
            >
              {errorText ? (
                <p className="text-xs font-medium text-red-500">{errorText}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
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
  ({ className, error, success, floatingLabel, errorText, helperText, value, defaultValue, onFocus, onBlur, disabled, ...props }, ref) => {
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
          "relative w-full rounded-lg border bg-white dark:bg-slate-900 transition-shadow duration-200 overflow-hidden shadow-sm",
          {
            "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700": !error && !success && !isFocused && !disabled,
            "border-blue-500 ring-4 ring-blue-500/15 dark:ring-blue-400/15": isFocused && !error,
            "border-red-500 ring-4 ring-red-500/15 dark:ring-red-500/15": error,
            "border-emerald-500 ring-4 ring-emerald-500/15 dark:ring-emerald-500/15": success,
            "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50": disabled,
          },
          className
        )}>
          <div className="relative px-3 py-2 min-h-[80px]">
            {floatingLabel && (
              <motion.label
                htmlFor={id}
                initial={false}
                animate={{
                  y: isFloating ? -2 : 12,
                  scale: isFloating ? 0.75 : 1,
                  color: error ? '#ef4444' : isFocused ? '#3b82f6' : '#64748b'
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute start-3 origin-top-left pointer-events-none font-medium z-10"
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
              disabled={disabled}
              className={cn(
                "w-full bg-transparent outline-none border-none text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 resize-y min-h-[60px] z-20",
                "focus:ring-0 [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset]",
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
              initial={{ opacity: 0, y: -2, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -2, height: 0 }}
              className="px-1"
            >
              {errorText ? (
                <p className="text-xs font-medium text-red-500">{errorText}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
