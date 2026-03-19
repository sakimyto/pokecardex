// Mapping between pokemontcg.io EN set IDs and JP set data
// JP and EN sets don't map 1:1 — JP releases more granular packs
// This maps EN sets to their closest JP equivalent for display purposes

export interface JpSetInfo {
  id: string // our internal ID (matches EN set ID for simplicity)
  codeJa: string
  nameJa: string
  seriesJa: string
  releaseDateJa: string
}

// EN pokemontcg.io set ID → JP set info
export const svSetMapping: Record<string, JpSetInfo> = {
  sv1: {
    id: 'sv1',
    codeJa: 'SV1',
    nameJa: 'スカーレットex & バイオレットex',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2023-01-20',
  },
  sv2: {
    id: 'sv2',
    codeJa: 'SV2',
    nameJa: 'クレイバースト & スノーハザード',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2023-04-14',
  },
  sv3: {
    id: 'sv3',
    codeJa: 'SV3',
    nameJa: '黒炎の支配者',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2023-07-28',
  },
  sv3pt5: {
    id: 'sv3pt5',
    codeJa: 'SV2a',
    nameJa: 'ポケモンカード151',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2023-06-16',
  },
  sv4: {
    id: 'sv4',
    codeJa: 'SV4',
    nameJa: '古代の咆哮 & 未来の一閃',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2023-10-27',
  },
  sv4pt5: {
    id: 'sv4pt5',
    codeJa: 'SV4a',
    nameJa: 'シャイニートレジャーex',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2023-12-01',
  },
  sv5: {
    id: 'sv5',
    codeJa: 'SV5',
    nameJa: 'ワイルドフォース & サイバージャッジ',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2024-01-26',
  },
  sv6: {
    id: 'sv6',
    codeJa: 'SV6',
    nameJa: '変幻の仮面',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2024-04-26',
  },
  sv6pt5: {
    id: 'sv6pt5',
    codeJa: 'SV6a',
    nameJa: 'ナイトワンダラー',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2024-06-07',
  },
  sv7: {
    id: 'sv7',
    codeJa: 'SV7',
    nameJa: 'ステラミラクル',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2024-07-19',
  },
  sv8: {
    id: 'sv8',
    codeJa: 'SV8',
    nameJa: '超電ブレイカー',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2025-01-24',
  },
  sv8pt5: {
    id: 'sv8pt5',
    codeJa: 'SV8pt5',
    nameJa: 'プリズマティックエボリューション',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2025-01-17',
  },
  sv9: {
    id: 'sv9',
    codeJa: 'SV9',
    nameJa: 'バトルパートナーズ',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2025-03-07',
  },
  sv10: {
    id: 'sv10',
    codeJa: 'SV10',
    nameJa: '超克のライジン',
    seriesJa: 'スカーレット＆バイオレット',
    releaseDateJa: '2025-06-06',
  },
}

// Which EN sets to import (recent, high-value sets)
export const setsToImport = [
  'sv3pt5', // 151 — iconic, high collector value
  'sv4pt5', // Shiny Treasure ex
  'sv6', // Twilight Masquerade
  'sv6pt5', // Shrouded Fable
  'sv7', // Stellar Crown
  'sv8', // Surging Sparks
  'sv8pt5', // Prismatic Evolutions
  'sv9', // Journey Together
  'sv10', // Destined Rivals
]
