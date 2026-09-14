let requested = false;
const listeners = new Set<() => void>();
export function openNotificationInbox() { requested = true; listeners.forEach(listener => listener()); }
export function consumeInboxRequest() { const value = requested; requested = false; return value; }
export function subscribeInbox(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }