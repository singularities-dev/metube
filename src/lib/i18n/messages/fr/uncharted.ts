import type { Messages } from '../../index.ts';

/**
 * Uncharted topics: subjects MeTube itself picks for the Uncharted feed, far
 * from the user's usual viewing. The YouTube search stays in English; these are
 * the labels shown for it. Each appears in quotation marks in the status line
 * (Updated, charting “pottery”.) and after a colon in a tile's reason
 * (Uncharted: pottery), where only the first letter of the whole line is
 * capitalised. So write each as a bare noun phrase in the form that fits
 * mid-sentence: lower-case in English, French and Spanish, normal noun capitals
 * in German.
 */
export default {
  'uncharted.topic.pottery': 'poterie',
  'uncharted.topic.beekeeping': 'apiculture',
  'uncharted.topic.origami': 'origami',
  'uncharted.topic.birdwatching': 'observation des oiseaux',
  'uncharted.topic.blacksmithing': 'forge',
  'uncharted.topic.calligraphy': 'calligraphie',
  'uncharted.topic.bonsai': 'bonsaï',
  'uncharted.topic.sailing': 'voile',
  'uncharted.topic.mountaineering': 'alpinisme',
  'uncharted.topic.caveExploring': 'spéléologie',
  'uncharted.topic.architectureTour': 'visites d’architecture',
  'uncharted.topic.urbanPlanning': 'urbanisme',
  'uncharted.topic.linguistics': 'linguistique',
  'uncharted.topic.philosophyLecture': 'cours de philosophie',
  'uncharted.topic.opera': 'opéra',
  'uncharted.topic.jazzImprovisation': 'improvisation jazz',
  'uncharted.topic.folkDance': 'danse folklorique',
  'uncharted.topic.throatSinging': 'chant diphonique',
  'uncharted.topic.streetFood': 'cuisine de rue',
  'uncharted.topic.fermentation': 'fermentation',
  'uncharted.topic.teaCeremony': 'cérémonie du thé',
  'uncharted.topic.glassblowing': 'soufflage du verre',
  'uncharted.topic.woodcarving': 'sculpture sur bois',
  'uncharted.topic.knitting': 'tricot',
  'uncharted.topic.chessEndgames': 'finales aux échecs',
  'uncharted.topic.magicTricks': 'tours de magie',
  'uncharted.topic.juggling': 'jonglage',
  'uncharted.topic.parkour': 'parkour',
  'uncharted.topic.skateboarding': 'skateboard',
  'uncharted.topic.surfing': 'surf',
  'uncharted.topic.rockClimbing': 'escalade',
  'uncharted.topic.gardening': 'jardinage',
  'uncharted.topic.mushroomForaging': 'cueillette de champignons',
  'uncharted.topic.marineBiology': 'biologie marine',
  'uncharted.topic.paleontology': 'paléontologie',
  'uncharted.topic.archaeology': 'archéologie',
  'uncharted.topic.poetryReading': 'lectures de poésie',
  'uncharted.topic.signLanguage': 'langue des signes',
  'uncharted.topic.modelRailway': 'modélisme ferroviaire',
  'uncharted.topic.clockRepair': 'réparation d’horloges',
  'uncharted.topic.bookbinding': 'reliure',
  'uncharted.topic.stopMotionAnimation': 'animation image par image',
  'uncharted.topic.puppetry': 'marionnettes',
  'uncharted.topic.falconry': 'fauconnerie',
  'uncharted.topic.freediving': 'apnée',
  'uncharted.topic.competitiveCooking': 'concours de cuisine',
  'uncharted.topic.ballet': 'ballet',
  'uncharted.topic.beatboxing': 'beatbox',
  'uncharted.topic.tinyHouses': 'micro-maisons',
  'uncharted.topic.shipbuilding': 'construction navale',
  'uncharted.topic.cartography': 'cartographie',
  'uncharted.topic.sheepdogTrials': 'concours de chiens de berger',
  'uncharted.topic.lacrosse': 'lacrosse',
  'uncharted.topic.curling': 'curling',
  'uncharted.topic.sumo': 'sumo',
  'uncharted.topic.kiteMaking': 'fabrication de cerfs-volants',
} satisfies Messages;
