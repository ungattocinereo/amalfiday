// The mobile menu owns one history entry while it is open, so the system "back" closes it.

export const MENU_STATE = Object.freeze({ mobileMenu: true })

export const isMenuState = (state) => Boolean(state && state.mobileMenu === true)

/**
 * How to close the menu.
 * - 'direct': just close; nothing to undo in history.
 * - 'back': close, then pop our entry with history.back().
 * - 'back-then-go': a link was tapped; pop our entry first, then navigate, so no stale entry stays behind.
 * `source` is 'popstate' (the entry is already gone), 'link' or anything else (button, Esc, swipe).
 */
export function planClose({ source, state }) {
  if (source === 'popstate' || !isMenuState(state)) return 'direct'
  return source === 'link' ? 'back-then-go' : 'back'
}

/** A link tap that the browser should handle itself (new tab, download, modifier keys). */
export function isPlainNavigation({ button = 0, metaKey, ctrlKey, shiftKey, altKey, target, download }) {
  return button === 0 && !metaKey && !ctrlKey && !shiftKey && !altKey && (!target || target === '_self') && download == null
}
