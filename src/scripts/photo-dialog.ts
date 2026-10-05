export function setupPhotoDialog(dialog: HTMLDialogElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  let previousOverflow = ''
  const dialogTriggers = new WeakMap<HTMLDialogElement, HTMLElement>()
  const openDialog = (dialog: HTMLDialogElement, trigger: HTMLElement) => {
    dialogTriggers.set(dialog, trigger)
    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    dialog.classList.remove('is-closing')
    dialog.showModal()
  }
  const closeDialog = (dialog: HTMLDialogElement) => {
    if (dialog.classList.contains('is-closing')) return
    dialog.classList.add('is-closing')
    window.setTimeout(() => {
      dialog.close()
      dialog.classList.remove('is-closing')
    }, reduced.matches ? 0 : 220)
  }
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(dialog)))
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog) })
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return
    const r = dialog.getBoundingClientRect()
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog)
  })
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow
    dialogTriggers.get(dialog)?.focus({ preventScroll: true })
  })

  return (trigger: HTMLElement) => openDialog(dialog, trigger)
}
