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
export const setMapping: Record<string, JpSetInfo> = {
  // === Classic Sets (WOTC Era) ===
  base1: {
    id: 'base1',
    codeJa: '第1弾',
    nameJa: 'ポケットモンスターカードゲーム 第1弾 拡張パック',
    seriesJa: 'ポケットモンスターカードゲーム',
    releaseDateJa: '1996-10-20',
  },
  base2: {
    id: 'base2',
    codeJa: 'ジャングル',
    nameJa: 'ポケットモンスターカードゲーム ジャングル',
    seriesJa: 'ポケットモンスターカードゲーム',
    releaseDateJa: '1997-03-05',
  },
  base3: {
    id: 'base3',
    codeJa: '化石',
    nameJa: 'ポケットモンスターカードゲーム 化石の秘密',
    seriesJa: 'ポケットモンスターカードゲーム',
    releaseDateJa: '1997-06-21',
  },
  base4: {
    id: 'base4',
    codeJa: 'R',
    nameJa: 'ポケットモンスターカードゲーム 第2弾 拡張パック',
    seriesJa: 'ポケットモンスターカードゲーム',
    releaseDateJa: '1997-09-01',
  },
  base5: {
    id: 'base5',
    codeJa: 'TR',
    nameJa: 'ポケットモンスターカードゲーム ロケット団',
    seriesJa: 'ポケットモンスターカードゲーム',
    releaseDateJa: '1997-11-21',
  },
  gym1: {
    id: 'gym1',
    codeJa: 'タマムシ',
    nameJa: 'ポケモンジム第1弾 リーダーズスタジアム',
    seriesJa: 'ポケモンジム',
    releaseDateJa: '1998-10-23',
  },
  gym2: {
    id: 'gym2',
    codeJa: 'ヤマブキ',
    nameJa: 'ポケモンジム第2弾 闇からの挑戦',
    seriesJa: 'ポケモンジム',
    releaseDateJa: '1999-03-19',
  },
  neo1: {
    id: 'neo1',
    codeJa: '金銀',
    nameJa: 'ポケモンカード★neo 金、銀、新世界へ...',
    seriesJa: 'ポケモンカード★neo',
    releaseDateJa: '1999-12-10',
  },
  neo2: {
    id: 'neo2',
    codeJa: '遺跡',
    nameJa: 'ポケモンカード★neo 遺跡をこえて...',
    seriesJa: 'ポケモンカード★neo',
    releaseDateJa: '2000-04-14',
  },
  neo3: {
    id: 'neo3',
    codeJa: '覚醒',
    nameJa: 'ポケモンカード★neo めざめる伝説',
    seriesJa: 'ポケモンカード★neo',
    releaseDateJa: '2000-06-16',
  },
  neo4: {
    id: 'neo4',
    codeJa: '闇光',
    nameJa: 'ポケモンカード★neo 闇、そして光へ...',
    seriesJa: 'ポケモンカード★neo',
    releaseDateJa: '2001-03-23',
  },
  // === Sword & Shield Era (Popular Sets) ===
  swsh1: {
    id: 'swsh1',
    codeJa: 'S1',
    nameJa: 'ソード & シールド',
    seriesJa: 'ソード＆シールド',
    releaseDateJa: '2019-12-06',
  },
  swsh7: {
    id: 'swsh7',
    codeJa: 'S7',
    nameJa: '蒼空ストリーム & 摩天パーフェクト',
    seriesJa: 'ソード＆シールド',
    releaseDateJa: '2021-07-09',
  },
  swsh9: {
    id: 'swsh9',
    codeJa: 'S9',
    nameJa: 'スターバース',
    seriesJa: 'ソード＆シールド',
    releaseDateJa: '2022-01-14',
  },
  swsh11: {
    id: 'swsh11',
    codeJa: 'S11',
    nameJa: 'ロストアビス',
    seriesJa: 'ソード＆シールド',
    releaseDateJa: '2022-07-15',
  },
  swsh12pt5: {
    id: 'swsh12pt5',
    codeJa: 'S12a',
    nameJa: 'VSTARユニバース',
    seriesJa: 'ソード＆シールド',
    releaseDateJa: '2022-12-02',
  },
  // === Scarlet & Violet Sets ===
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

// Backwards compat alias
export const svSetMapping = setMapping

// Which EN sets to import
export const setsToImport = [
  // Classic sets (collector value, nostalgia)
  'base1', // Base Set
  'base2', // Jungle
  'base3', // Fossil
  'base4', // Base Set 2
  'base5', // Team Rocket
  'gym1', // Gym Heroes
  'gym2', // Gym Challenge
  'neo1', // Neo Genesis
  'neo2', // Neo Discovery
  'neo3', // Neo Revelation
  'neo4', // Neo Destiny
  // Sword & Shield popular sets
  'swsh1', // Sword & Shield base
  'swsh7', // Evolving Skies
  'swsh9', // Brilliant Stars
  'swsh11', // Lost Origin
  'swsh12pt5', // Crown Zenith
  // Scarlet & Violet — all main sets
  'sv1', // Scarlet & Violet base
  'sv2', // Paldea Evolved
  'sv3', // Obsidian Flames
  'sv3pt5', // 151 — iconic, high collector value
  'sv4', // Paradox Rift
  'sv4pt5', // Shiny Treasure ex / Paldean Fates
  'sv5', // Temporal Forces
  'sv6', // Twilight Masquerade
  'sv6pt5', // Shrouded Fable
  'sv7', // Stellar Crown
  'sv8', // Surging Sparks
  'sv8pt5', // Prismatic Evolutions
  'sv9', // Journey Together
  'sv10', // Destined Rivals
]
