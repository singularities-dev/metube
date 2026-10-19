import type { Messages } from '../../index.ts';

/** Words and phrases shared across the app. */
export default {
  'common.undo': 'Undo',
  'common.dismissMessage': 'Dismiss message',
  'common.remove': 'Remove',
  'common.save': 'Save',
  'common.done': 'Done',
  'common.ok': 'OK',
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.showMore': { one: 'Show {count} more', other: 'Show {count} more' },
  'common.units': { one: '{count} unit', other: '{count} units' },
  'common.unitsUsed': { zero: 'No units used.', one: '{count} unit used.', other: '{count} units used.' },
  'common.videos': { one: '{count} video', other: '{count} videos' },
  'common.channels': { one: '{count} channel', other: '{count} channels' },
  'common.newTab': '(opens in a new tab)',
  'common.youtubeTerms': 'YouTube Terms of Service',
  'common.googlePrivacy': 'Google Privacy Policy',
} satisfies Messages;
