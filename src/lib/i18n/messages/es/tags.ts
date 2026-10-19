import type { Messages } from '../../index.ts';

/**
 * The Tags page: liked and blocked tags, and suggestions from searches and from
 * videos in the feed. {tag} is a tag or search phrase, shown as it is. "Settings"
 * and "Explore" name the app's sections and must match their navigation labels
 * (app.nav.settings, app.nav.explore).
 */
export default {
  'tags.title': 'Etiquetas',
  'tags.activityTitle': 'Actividad',
  /** Accessible name of the row of two tabs ("Your tags", "Activity") that switch this page's section. */
  'tags.tabs': 'Sección',
  'tags.tab.tags': 'Tus etiquetas',
  'tags.tab.activity': 'Actividad',
  'tags.lede': 'Las etiquetas dan forma a cada feed, sea cual sea tu estado de ánimo. Las etiquetas que te gustan suben al principio; las bloqueadas no aparecen nunca.',

  /** Heading of the list of liked tags (show more videos with these tags); also the list's accessible name. */
  'tags.liked': 'Más de esto',
  'tags.liked.placeholder': 'Añade una etiqueta que te guste',
  /** Heading of the list of blocked tags (hide videos with these tags); also the list's accessible name. */
  'tags.blocked': 'No mostrar nunca',
  'tags.blocked.placeholder': 'Añade una etiqueta para bloquear',

  'tags.fromSearches': 'De tus búsquedas',
  'tags.fromSearches.hint': 'Frases y palabras frecuentes de tu historial de búsqueda importado. El número indica cuántas veces has buscado cada una.',
  'tags.fromSearches.empty': 'Importa tu historial de búsqueda en Configuración para ver sugerencias aquí.',
  /** Shown on hover over a suggested search phrase and read after it by screen readers. */
  'tags.fromSearches.detail': { one: '{count} búsqueda', other: '{count} búsquedas' },
  'tags.fromVideos': 'De vídeos de tu feed',
  'tags.fromVideos.hint': 'Etiquetas que los creadores ponen en los vídeos recientes de tu feed, con el número de vídeos en los que aparece cada una. Se actualizan junto con tu feed.',
  'tags.fromVideos.empty': 'Abre Explorar para cargar tu feed y aquí aparecerán sugerencias.',
  /** Shown on hover over a suggested tag and read after it by screen readers. */
  'tags.fromVideos.detail': { one: 'En {count} vídeo de tu feed', other: 'En {count} vídeos de tu feed' },

  /** Icon button on a suggestion: adds {tag} to "More of". */
  'tags.like': 'Ver más de {tag}',
  /** Tooltip of that button. */
  'tags.like.title': 'Ver más de esto',
  /** Icon button on a suggestion: adds {tag} to "Never show". */
  'tags.block': 'Bloquear {tag}',
  /** Tooltip of that button. */
  'tags.block.title': 'No mostrar nunca esto',
} satisfies Messages;
