import type { Messages } from '../../index.ts';

/**
 * The About panel at the end of Settings: version, policies, licence and links.
 * {version} is the extension's version, such as 0.1.0. Tags wrap link text:
 * <terms> YouTube's Terms of Service, <privacy> Google's Privacy Policy,
 * <policy> MeTube's privacy policy, <permissions> the Google Account page for
 * third-party access, <link> the licence. Use the documents' official names.
 * MeTube's privacy policy (<policy>) is only in English: say so after the link
 * in other languages.
 */
export default {
  'about.heading': 'Acerca de MeTube',
  'about.terms': 'Versión {version} (beta). MeTube usa los Servicios de la API de YouTube. Al usar MeTube, aceptas los <terms>Términos del Servicio de YouTube</terms>; el uso que Google hace de los datos se rige por la <privacy>Política de Privacidad de Google</privacy>.',
  'about.privacy': 'MeTube lo guarda todo en este navegador y no tiene servidores. Lee la <policy>política de privacidad de MeTube</policy> (en inglés). Si has usado la sincronización de valoraciones, puedes quitar el acceso de MeTube cuando quieras en los <permissions>permisos de tu cuenta de Google</permissions>.',
  'about.licence': 'Software libre con licencia <link>GNU GPL v3</link>.',
  'about.source': 'Código fuente',
  'about.issues': 'Informar de un problema',
} satisfies Messages;
