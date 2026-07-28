import type { CrucialMoment } from '../types'

export const CRUCIAL_MOMENTS: CrucialMoment[] = [
  {
    id: 'cm_final_shot',
    title: 'Dernier tir du match',
    body: "Il reste 4 secondes, le match est à égalité. Le ballon est dans tes mains au niveau de la ligne à trois points.",
    choices: [
      {
        id: 'shot_three',
        text: "Tenter le tir à trois points pour gagner immédiatement",
        swing: 10,
        successChance: 0.55,
        effect: { reputation: 4, charisma: 1 },
        resultTextSuccess: "Le ballon traverse le filet à la dernière seconde ! La salle explose de joie.",
        resultTextFail: "Le tir heurte le cercle et ressort. Le match part en prolongation, tendue.",
      },
      {
        id: 'shot_drive',
        text: "Pénétrer vers le panier pour un tir à haut pourcentage",
        swing: 6,
        successChance: 0.7,
        effect: { athleticism: 1 },
        resultTextSuccess: "Tu déjoues ton défenseur et marques un lay-up décisif !",
        resultTextFail: "Contré au dernier moment ! L'action ne passe pas mais l'équipe se bat encore.",
      },
      {
        id: 'shot_pass',
        text: "Faire la passe décisive à un coéquipier démarqué",
        swing: 4,
        successChance: 0.65,
        effect: { playmaking: 2, charisma: 2 },
        resultTextSuccess: "Passe parfaite ! Ton coéquipier ne tremble pas et marque le panier de la victoire.",
        resultTextFail: "La défense anticipe la passe et l'intercepte. Occasion manquée.",
      },
    ],
  },
  {
    id: 'cm_clutch_defense',
    title: 'Stop défensif décisif',
    body: "L'adversaire a le ballon, à égalité, 8 secondes à jouer. Leur meilleur scoreur s'apprête à attaquer ton camp.",
    choices: [
      {
        id: 'def_lockdown',
        text: "Le prendre en un contre un serré, sans aide",
        swing: 8,
        successChance: 0.6,
        effect: { defense: 2 },
        resultTextSuccess: "Défense exceptionnelle ! Tu forces la maladresse et récupères le ballon.",
        resultTextFail: "Il te déborde et marque le panier de la victoire pour l'adversaire.",
      },
      {
        id: 'def_double',
        text: "Appeler un double-team pour le piéger",
        swing: 5,
        successChance: 0.7,
        effect: { iq: 2 },
        resultTextSuccess: "Le piège fonctionne, il perd le ballon sous la pression !",
        resultTextFail: "Il trouve l'homme libre laissé par le double-team. Panier adverse.",
      },
    ],
  },
  {
    id: 'cm_press_conference',
    title: 'Point presse à la mi-temps',
    body: "Ton équipe est menée de 10 points à la pause. Le coach te demande de parler au groupe avant de repartir sur le terrain.",
    choices: [
      {
        id: 'press_fire_up',
        text: "Hausser le ton pour réveiller le groupe",
        swing: 7,
        successChance: 0.5,
        effect: { charisma: 3 },
        resultTextSuccess: "Le discours électrise l'équipe qui revient transformée en seconde période !",
        resultTextFail: "Le discours tombe à plat, l'équipe reste amorphe malgré tes efforts.",
      },
      {
        id: 'press_calm',
        text: "Rester calme et recentrer tout le monde sur les fondamentaux",
        swing: 5,
        successChance: 0.68,
        effect: { iq: 2, morale: 3 },
        resultTextSuccess: "L'équipe retrouve de la lucidité et resserre son jeu en seconde période.",
        resultTextFail: "Le discours posé ne suffit pas à inverser la dynamique du match.",
      },
    ],
  },
  {
    id: 'cm_overtime_fatigue',
    title: 'Prolongation, jambes lourdes',
    body: "Le match est allé en prolongation. Tu sens la fatigue peser sur tes appuis, mais l'équipe compte sur toi pour ce money-time.",
    choices: [
      {
        id: 'ot_push_through',
        text: "Puiser dans tes réserves et hausser ton engagement physique",
        swing: 9,
        successChance: 0.5,
        effect: { energy: -8, athleticism: 1 },
        resultTextSuccess: "Un sursaut d'énergie incroyable te permet de porter l'équipe jusqu'au bout !",
        resultTextFail: "Le corps ne suit plus. Tu multiplies les imprécisions en fin de match.",
      },
      {
        id: 'ot_smart_play',
        text: "Économiser ton énergie en jouant plus simple et plus intelligent",
        swing: 5,
        successChance: 0.72,
        effect: { iq: 2, energy: -3 },
        resultTextSuccess: "En limitant les efforts inutiles, tu restes décisif jusqu'à la sirène.",
        resultTextFail: "Malgré la gestion d'effort, l'adversaire garde la main sur la fin de match.",
      },
    ],
  },
]

export function pickRandomCrucialMoment(excludeIds: string[]): CrucialMoment {
  const pool = CRUCIAL_MOMENTS.filter((c) => !excludeIds.includes(c.id))
  const source = pool.length > 0 ? pool : CRUCIAL_MOMENTS
  return source[Math.floor(Math.random() * source.length)]
}
