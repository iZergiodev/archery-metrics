export type CurrentShaftSource = {
  manufacturer: string
  title: string
  url: string
  publicationYear?: number
  accessedOn: string
}

export const CURRENT_SHAFT_SOURCES = {
  easton_2026_x10: {
    manufacturer: 'Easton',
    title: 'X10 product specifications',
    url: 'https://eastonarchery.com/arrows_/x10/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  easton_2026_ace: {
    manufacturer: 'Easton',
    title: 'A/C/E product specifications',
    url: 'https://eastonarchery.com/arrows_/a-c-e/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  easton_2026_5_0: {
    manufacturer: 'Easton',
    title: 'Easton 5.0 product specifications',
    url: 'https://eastonarchery.com/arrows_/easton-5-0/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  easton_2026_5mm_fmj: {
    manufacturer: 'Easton',
    title: '5MM FMJ product specifications',
    url: 'https://eastonarchery.com/arrows_/5mm-full-metal-jacket/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  victory_2026_vxt: {
    manufacturer: 'Victory Archery',
    title: 'VXT target arrow specifications',
    url: 'https://victoryarchery.com/arrows-target/vxt/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  victory_2026_vap: {
    manufacturer: 'Victory Archery',
    title: 'VAP target arrow specifications',
    url: 'https://victoryarchery.com/arrows-target/vap/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  victory_2026_rip_tko: {
    manufacturer: 'Victory Archery',
    title: 'RIP TKO hunting arrow specifications',
    url: 'https://victoryarchery.com/arrows-hunting/rip-tko/',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  gold_tip_2026_pierce_tour: {
    manufacturer: 'Gold Tip',
    title: 'Kinetic Pierce Tour Arrows .166',
    url: 'https://goldtip.com/collections/arrows/products/kinetic-pierce-tour-target-arrows',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  gold_tip_2026_airstrike: {
    manufacturer: 'Gold Tip',
    title: 'Airstrike Arrows .204',
    url: 'https://goldtip.com/collections/arrows/products/airstrike-hunting-arrows',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  gold_tip_2026_hunter_xt: {
    manufacturer: 'Gold Tip',
    title: 'Hunter XT Arrows .246',
    url: 'https://goldtip.com/collections/arrows/products/hunter-xt-hunting-arrows',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  black_eagle_2026_x_impact: {
    manufacturer: 'Black Eagle',
    title: 'X Impact Arrows and Shafts',
    url: 'https://blackeaglearrows.com/collections/hunting-arrows/products/x-impact-fletched-arrows',
    accessedOn: '2026-07-11',
  },
  black_eagle_2026_rampage: {
    manufacturer: 'Black Eagle',
    title: 'Rampage carbon hunting arrows and shafts',
    url: 'https://blackeaglearrows.com/collections/hunting-arrows/products/rampage-fletched-arrows',
    accessedOn: '2026-07-11',
  },
  skylon_2026_paragon: {
    manufacturer: 'Skylon',
    title: 'Paragon shaft specifications',
    url: 'https://www.skylonarchery.com/arrows/id-3-2/paragon',
    accessedOn: '2026-07-11',
  },
  fivics_2026_five_x: {
    manufacturer: 'FIVICS',
    title: 'FIVE-X shaft specifications',
    url: 'https://www.fivics.com/shop/product/detail/37',
    publicationYear: 2026,
    accessedOn: '2026-07-11',
  },
  pandarus_2026_elite_ca320: {
    manufacturer: 'Pandarus',
    title: 'ELITE CA320 shaft specifications',
    url: 'https://www.pandarusarchery.com/elite_ca320',
    accessedOn: '2026-07-11',
  },
} as const satisfies Record<string, CurrentShaftSource>

export type CurrentShaftSourceId = keyof typeof CURRENT_SHAFT_SOURCES
