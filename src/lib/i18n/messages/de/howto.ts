import type { Messages } from '../../index.ts';

/**
 * Step-by-step guides and their copy-to-clipboard fields. {label} names the
 * value being copied, e.g. “Redirect URL”.
 */
export default {
  /** Read by screen readers before the value. */
  'howto.field': '{label}:',
  /** The copy button. Only the text outside <sr>…</sr> is visible; the whole message is the button’s accessible name, so keep the visible word in it. */
  'howto.copy': 'Kopieren<sr>: {label}</sr>',
  /** The copy button for a moment after copying; as howto.copy. */
  'howto.copied': 'Kopiert<sr>: {label}</sr>',
  /** Announced by screen readers after copying. */
  'howto.copiedStatus': '{label} kopiert',
} satisfies Messages;
