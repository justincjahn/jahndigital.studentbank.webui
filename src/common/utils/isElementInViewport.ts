/**
 * Checks to see if an element is in the current viewport vertically.
 *
 * @param el The element to check.
 * @returns `true` if the element is in the viewport.
 */
export default function isElementInViewport(el: HTMLElement): boolean {
  let rect = el.getBoundingClientRect();
  const { top, bottom } = rect;
  const { clientHeight } = document.documentElement;

  // The top of the element is out of bounds
  if (top < 0) return false;

  // The bottom of the element is out of bounds
  if (bottom > clientHeight) return false;

  let parent = el.parentNode;

  // eslint-disable-next-line no-unreachable-loop
  do {
    if (parent === null) break;

    if (
      (parent as HTMLElement).scrollHeight >
      (parent as HTMLElement).clientHeight
    ) {
      rect = (parent as HTMLElement).getBoundingClientRect();

      // The top of the element is out of bounds
      if (top < rect.top) return false;

      // The bottom of the element is out of bounds.
      if (bottom >= rect.bottom) return false;
    }

    parent = parent?.parentNode ?? null;
  } while (parent !== document.body);

  return true;
}
