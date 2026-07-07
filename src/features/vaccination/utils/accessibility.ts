export function announceToScreenReader(message: string): void {
  if (typeof document === 'undefined') return;

  let announcer = document.getElementById('vaccination-sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'vaccination-sr-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer!.textContent = message;
  });
}

export function announceSuccess(message: string): void {
  announceToScreenReader(`Success: ${message}`);
}

export function announceError(message: string): void {
  if (typeof document === 'undefined') return;

  let announcer = document.getElementById('vaccination-sr-error-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'vaccination-sr-error-announcer';
    announcer.setAttribute('role', 'alert');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer!.textContent = `Error: ${message}`;
  });
}

export function focusElement(elementId: string): void {
  if (typeof document === 'undefined') return;

  const el = document.getElementById(elementId);
  if (el) {
    el.focus();
  }
}

export function focusFirstFocusable(containerId: string): void {
  if (typeof document === 'undefined') return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const focusable = container.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus();
}

export function trapFocus(containerId: string, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }
}
