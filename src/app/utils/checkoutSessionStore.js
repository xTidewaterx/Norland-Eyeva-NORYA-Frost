const STORAGE_KEY = "norya_checkout_session";

export const checkoutSessionStore = {
  get() {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch (error) {
      sessionStorage.removeItem(STORAGE_KEY);
      throw error;
    }
  },
  set(session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },
  clear() {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
