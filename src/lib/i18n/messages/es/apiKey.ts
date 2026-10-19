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
  'apiKey.heading': 'Clave de API de YouTube',
  'apiKey.intro': 'Tu propia clave de Google Cloud, restringida a YouTube Data API v3. Se guarda solo en este navegador. Al usarla, aceptas los <link>Términos del Servicio de YouTube</link>.',
  'apiKey.field': 'Clave de YouTube Data API',
  'apiKey.placeholder': 'Pega la clave de API',
  'apiKey.save': 'Guardar y probar',
  'apiKey.testing': 'Probando…',
  'apiKey.works': 'La clave funciona. Se ha usado 1 unidad para probarla.',
  'apiKey.howTo.title': 'Cómo conseguir una clave de API',
  'apiKey.howTo.step1': 'Abre la <link>Google Cloud Console</link> e inicia sesión. Es gratis: la cuota predeterminada no requiere facturación. El enlace abre la consola en inglés para que sus menús coincidan con los nombres en negrita de abajo.',
  'apiKey.howTo.step2': 'En el selector de proyectos de la parte superior, elige <b>New project</b> para crear uno, p. ej., «metube», y comprueba que está seleccionado.',
  'apiKey.howTo.step3': 'Ve a <b>APIs & Services → Library</b>, busca <b>YouTube Data API v3</b> y haz clic en <b>Enable</b>.',
  'apiKey.howTo.step4': 'Ve a <b>APIs & Services → Credentials</b> y después elige <b>Create credentials → API key</b>.',
  'apiKey.howTo.step5': 'Abre la clave nueva. En <b>API restrictions</b>, elige <b>Restrict key</b> y marca solo YouTube Data API v3. Deja <b>Application restrictions</b> en <b>None</b>: las extensiones no envían la dirección de un sitio web, así que una restricción por sitio web bloquearía MeTube. Guarda los cambios.',
  'apiKey.howTo.step6': 'Copia la clave, pégala arriba y selecciona <em>{button}</em>.',
  'apiKey.howTo.note': 'Mantén la clave en secreto. Te da {units} unidades al día y el medidor de cuota de MeTube lleva la cuenta.',
} satisfies Messages;
