import type { Messages } from '../../index.ts';

/**
 * The YouTube API key panel in Settings, with its step-by-step guide.
 * Text in <b>…</b> names Google Cloud Console menus, buttons and options: keep
 * it in English as written. <b> is marked as English, so screen readers say it
 * the way the Console shows it; put nothing translated inside it. <em>…</em> is
 * translated emphasis (bold too): in step 6, {button} is this panel's “Save and
 * test” button. The guide's link opens the Console in English, which step 1
 * tells the user. {units} is a number.
 */
export default {
  'apiKey.heading': 'Clé API YouTube',
  'apiKey.intro': 'Votre propre clé Google Cloud, restreinte à YouTube Data API v3. Enregistrée uniquement dans ce navigateur. En l’utilisant, vous acceptez les <link>Conditions d’utilisation de YouTube</link>.',
  'apiKey.field': 'Clé API YouTube Data',
  'apiKey.placeholder': 'Coller la clé API',
  'apiKey.save': 'Enregistrer et tester',
  'apiKey.testing': 'Test en cours…',
  'apiKey.works': 'La clé fonctionne. 1 unité utilisée pour le test.',
  'apiKey.howTo.title': 'Comment obtenir une clé API',
  'apiKey.howTo.step1': 'Ouvrez la <link>Google Cloud Console</link> et connectez-vous. C’est gratuit : aucune facturation n’est nécessaire pour le quota par défaut. Le lien ouvre la console en anglais, pour que ses menus correspondent aux noms en gras ci-dessous.',
  'apiKey.howTo.step2': 'Dans le sélecteur de projet en haut, choisissez <b>New project</b> pour créer un projet, par exemple « metube », puis vérifiez qu’il est sélectionné.',
  'apiKey.howTo.step3': 'Allez dans <b>APIs & Services → Library</b>, cherchez <b>YouTube Data API v3</b> et cliquez sur <b>Enable</b>.',
  'apiKey.howTo.step4': 'Allez dans <b>APIs & Services → Credentials</b>, puis <b>Create credentials → API key</b>.',
  'apiKey.howTo.step5': 'Ouvrez la nouvelle clé. Sous <b>API restrictions</b>, choisissez <b>Restrict key</b> et cochez uniquement YouTube Data API v3. Laissez <b>Application restrictions</b> sur <b>None</b> : les extensions n’envoient pas d’adresse de site web, donc une restriction par site web bloquerait MeTube. Enregistrez.',
  'apiKey.howTo.step6': 'Copiez la clé, collez-la ci-dessus et choisissez <em>{button}</em>.',
  'apiKey.howTo.note': 'Gardez cette clé secrète. Elle donne droit à {units} unités par jour ; la jauge de quota de MeTube en suit l’utilisation.',
} satisfies Messages;
