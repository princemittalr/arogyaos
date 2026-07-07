export function announceToScreenReader(message: string): void {
  if (typeof document === 'undefined') return;

  let announcer = document.getElementById('apt-aria-live');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'apt-aria-live';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer!.textContent = message;
  });
}

export function focusElement(elementId: string): void {
  if (typeof document === 'undefined') return;

  const el = document.getElementById(elementId);
  if (el) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: false });
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

export function restoreFocus(previousActiveElement: HTMLElement | null): void {
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus({ preventScroll: false });
  }
}

export function getTrapFocusHandler(containerId: string): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
}

export function createKeyboardNavigator<T>(
  items: T[],
  onActivate: (item: T, index: number) => void,
) {
  return (event: React.KeyboardEvent, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, items.length - 1);
        focusElement(`apt-item-${nextIndex}`);
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        focusElement(`apt-item-${prevIndex}`);
        break;
      }
      case 'Home': {
        event.preventDefault();
        focusElement('apt-item-0');
        break;
      }
      case 'End': {
        event.preventDefault();
        focusElement(`apt-item-${items.length - 1}`);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        onActivate(items[currentIndex], currentIndex);
        break;
      }
    }
  };
}

export function getAriaAnnouncementForStatusChange(
  appointmentId: string,
  oldStatus: string,
  newStatus: string,
): string {
  return `Appointment ${appointmentId.slice(-6)} changed from ${oldStatus.replace(/_/g, ' ').toLowerCase()} to ${newStatus.replace(/_/g, ' ').toLowerCase()}.`;
}

export const A11Y_STATUS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
  RESCHEDULED: 'Rescheduled',
};
