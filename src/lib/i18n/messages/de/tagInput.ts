import type { Messages } from '../../index.ts';

/**
 * A list of removable tags with a field to add more. {tag} is a tag, shown as
 * it is. tagInput.field is the add field's name for screen readers: {label} is
 * the list's label (e.g. "More of") and {placeholder} the field's placeholder
 * (e.g. "Add a tag"), both already translated.
 */
export default {
  'tagInput.remove': '{tag} entfernen',
  'tagInput.removed': 'Tag {tag} entfernt',
  'tagInput.field': '{label}: {placeholder}',
} satisfies Messages;
