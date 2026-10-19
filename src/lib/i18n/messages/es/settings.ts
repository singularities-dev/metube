import type { Messages } from '../../index.ts';

/**
 * The Settings page: appearance, feed options and the data section.
 * Labels name switches and sliders; hints are the line of help under them.
 * Names quoted in hints must match their labels elsewhere: Explore (the
 * navigation tab) and Edit mood. The page-size hint describes the button under
 * the feed instead of quoting it, since its label includes the count.
 * Shorts is YouTube's name for its short vertical videos: use YouTube's word.
 */
export default {
  'settings.heading': 'Configuración',
  'settings.appearance': 'Aspecto',
  'settings.theme': 'Tema',
  'settings.feed': 'Feed',
  'settings.pageSize': 'Vídeos por página',
  'settings.pageSize.hint': 'Cuántos vídeos muestra Explorar a la vez y cuántos más añade cada vez el botón que hay debajo del feed.',
  'settings.poolChannels': 'Canales de los que tomar vídeos',
  'settings.poolChannels.hint': {
    one: 'Los canales que más ves. Una actualización completa usa alrededor de {count} unidad.',
    other: 'Los canales que más ves. Una actualización completa usa alrededor de {count} unidades.',
  },
  'settings.uploadsPerChannel': 'Vídeos recientes por canal',
  'settings.perChannelCap': 'Máximo por canal en la primera página',
  'settings.perChannelCap.hint': 'Evita que un canal muy activo llene la primera página. Con 0, no hay límite.',
  'settings.moodFetch': 'Buscar vídeos nuevos cuando cambio de estado de ánimo',
  'settings.moodFetch.hint': 'Una búsqueda en YouTube por estado de ánimo (101 unidades), que se reutiliza durante 12 horas. Desactivado: los estados de ánimo solo reordenan los vídeos de tus canales.',
  'settings.autoMoods': 'Cambiar de estado de ánimo según su horario',
  'settings.autoMoods.hint': 'Los estados de ánimo con horario se activan solos cuando empieza su franja. Configura las horas en Explorar, en «Editar estado de ánimo».',
  'settings.playInline': 'Reproducir vídeos dentro de MeTube',
  'settings.playInline.hint': 'Al hacer clic en un vídeo, se abre aquí el reproductor de YouTube en una ventana, con las valoraciones al lado. Desactivado: se abre una pestaña nueva de YouTube. Ctrl+clic siempre abre una pestaña.',
  'settings.hideShorts': 'Ocultar Shorts',
  'settings.hideShorts.hint': 'Vídeos verticales de hasta 3 minutos, o de un minuto o menos si no se conoce el formato.',
  'settings.hideWatched': 'Ocultar vídeos que ya he visto',
  'settings.data': 'Tus datos',
  'settings.data.hint': 'Todo se guarda solo en este navegador. Borrar el historial importado no afecta a tus etiquetas, estados de ánimo ni configuración.',
  'settings.data.confirm': '¿Borrar de este navegador todo lo importado: historial de reproducciones, búsquedas, suscripciones y listas de reproducción?',
  'settings.data.clear': 'Borrar historial importado',
} satisfies Messages;
