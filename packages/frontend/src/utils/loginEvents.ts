export const OPEN_LOGIN_MODAL_EVENT = "komanda26:open-login-modal";

export function requestLoginModal() {
  window.dispatchEvent(new Event(OPEN_LOGIN_MODAL_EVENT));
}
