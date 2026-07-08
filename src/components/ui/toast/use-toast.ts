'use client';

import { useState, useEffect } from 'react';

const TOAST_LIMIT = 5;

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type ToastActionElement = React.ReactElement;

export interface ToastProps {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: ToastVariant;
}

export interface ToasterToast extends ToastProps {
  id: string;
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

let memoryState: State = { toasts: [] };
const listeners: Array<(state: State) => void> = [];

function dispatch(action: Action) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      };
      break;
    case 'DISMISS_TOAST':
    case 'REMOVE_TOAST':
      if (action.toastId) {
        memoryState = {
          ...memoryState,
          toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
        };
      } else {
        memoryState = {
          ...memoryState,
          toasts: [],
        };
      }
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

type ToastInput = string | ToastProps;

function normalize(input: ToastInput, variant: ToastVariant = 'default'): Omit<ToasterToast, 'id'> {
  if (typeof input === 'string') {
    return { title: input, variant };
  }
  return { ...input, variant };
}

function createToast(input: ToastInput, variant: ToastVariant = 'default') {
  const id = genId();
  const normalized = normalize(input, variant);
  
  dispatch({
    type: 'ADD_TOAST',
    toast: { ...normalized, id },
  });

  return id;
}

export const toast = Object.assign(
  (input: ToastInput) => createToast(input, 'default'),
  {
    success: (input: ToastInput) => createToast(input, 'success'),
    error: (input: ToastInput) => createToast(input, 'error'),
    warning: (input: ToastInput) => createToast(input, 'warning'),
    info: (input: ToastInput) => createToast(input, 'info'),
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
);

export function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: toast.dismiss,
  };
}
