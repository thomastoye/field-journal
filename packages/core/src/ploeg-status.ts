export type PloegStatus =
  | 'op-standplaats'
  | 'beschikbaar'
  | 'onderweg-naar-interventie'
  | 'aangekomen'
  | 'pauze'
  | 'maaltijd-pauze'
  | 'onbereikbaar'
  | 'onderweg-naar-hulppost-met-so'
  | 'onderweg-naar-standplaats'
  | 'in-hulppost'
  | 'in-ziekenhuis'

export const ploegStatusDetails: Record<PloegStatus, { icon: string; description: string }> = {
  'op-standplaats': {
    icon: 'home-map-marker',
    description: 'De ploeg is op hun standplaats',
  },
  onbereikbaar: {
    icon: 'account-alert',
    description: 'De ploeg is onbereikbaar',
  },
  pauze: {
    icon: 'account-clock',
    description: 'De ploeg heeft pauze',
  },
  aangekomen: {
    icon: 'flag',
    description: 'De ploeg is aangekomen op de plaats van interventie',
  },
  'onderweg-naar-hulppost-met-so': {
    icon: '',
    description: 'De ploeg is onderweg naar de hulppost en heeft een of meerdere slachtoffers mee',
  },
  'onderweg-naar-standplaats': {
    icon: 'keyboard-backspace',
    description: '',
  },
  'in-hulppost': {
    icon: 'hospital-box',
    description: 'De ploeg is in een hulppost',
  },
  'in-ziekenhuis': {
    icon: 'hospital-build',
    description: 'De ploeg is in een ziekenhuis',
  },
  beschikbaar: {
    icon: 'check',
    description: 'De ploeg is beschikbaar',
  },
  'onderweg-naar-interventie': {
    icon: 'run-fast',
    description: 'De ploeg is onderweg naar de plaats van interventie',
  },
  'maaltijd-pauze': {
    icon: 'silverware-fork-knife',
    description: 'De ploeg heeft (maaltijd)pauze',
  },
}

export const ploegStatus = Object.keys(ploegStatusDetails) as readonly PloegStatus[]
