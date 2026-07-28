import type { StoryEvent } from '../types'

// Generic interstitial events that can appear between games during any season.
export const INTERSTITIAL_EVENTS: StoryEvent[] = [
  {
    id: 'evt_media_day',
    title: 'Journée médias',
    body: "Un journaliste local souhaite t'interviewer après ta dernière performance. Comment abordes-tu l'échange ?",
    choices: [
      {
        id: 'media_confident',
        text: "Répondre avec assurance, mettre en avant tes ambitions",
        effect: { charisma: 2, reputation: 3 },
        resultText: "Ton assurance plaît. L'article te présente comme un talent à suivre de près.",
      },
      {
        id: 'media_humble',
        text: "Rester humble, insister sur le collectif",
        effect: { morale: 3, reputation: 1 },
        resultText: "Ton discours modeste rassure ton coach et te rend populaire dans le vestiaire.",
      },
    ],
  },
  {
    id: 'evt_injury_scare',
    title: 'Alerte physique',
    body: "Tu ressens une gêne à la cheville après l'entraînement. Le staff médical te propose deux options avant le prochain match.",
    choices: [
      {
        id: 'injury_rest',
        text: "Lever le pied et laisser la cheville récupérer pleinement",
        effect: { energy: 8, morale: -1 },
        resultText: "Tu repars sur de bonnes bases physiques, même si tu rates un peu de rythme de jeu.",
      },
      {
        id: 'injury_push',
        text: "Serrer les dents et continuer à fond, l'équipe a besoin de toi",
        effect: { energy: -6, reputation: 2 },
        resultText: "Ton abnégation impressionne le vestiaire, mais la fatigue s'accumule.",
      },
    ],
  },
  {
    id: 'evt_extra_workout',
    title: 'Séance supplémentaire',
    body: "Un coéquipier te propose une séance de tirs en plus, tard le soir, dans une salle vide.",
    choices: [
      {
        id: 'extra_accept',
        text: "Accepter, le travail supplémentaire paie toujours",
        effect: { shooting: 2, energy: -3 },
        resultText: "Séance intense. Ton tir progresse mais tes jambes sont lourdes.",
      },
      {
        id: 'extra_decline',
        text: "Décliner pour privilégier le repos",
        effect: { energy: 4 },
        resultText: "Tu récupères bien, prêt pour la suite du calendrier.",
      },
    ],
  },
  {
    id: 'evt_locker_conflict',
    title: 'Tension au vestiaire',
    body: "Un coéquipier critique ouvertement le système de jeu du coach devant tout le groupe. Tous les regards se tournent vers toi.",
    choices: [
      {
        id: 'conflict_support_coach',
        text: "Prendre la défense du coach et calmer le jeu",
        effect: { charisma: 2, defense: 1 },
        resultText: "Le coach t'en est reconnaissant. Ton statut dans le groupe grandit.",
      },
      {
        id: 'conflict_neutral',
        text: "Rester silencieux et laisser la situation se régler seule",
        effect: { morale: -2 },
        resultText: "La tension retombe doucement, mais certains attendaient une prise de position de ta part.",
      },
    ],
  },
  {
    id: 'evt_scout_watching',
    title: 'Un recruteur dans les tribunes',
    body: "On t'informe qu'un recruteur influent assiste au prochain entraînement ouvert. Comment gères-tu la pression ?",
    choices: [
      {
        id: 'scout_show_off',
        text: "En faire plus que d'habitude pour marquer les esprits",
        effect: { reputation: 3, energy: -3 },
        resultText: "Le recruteur note quelques highlights impressionnants, mais tu forces un peu ton jeu.",
      },
      {
        id: 'scout_natural',
        text: "Jouer normalement, sans changer ton approche",
        effect: { iq: 1, reputation: 1 },
        resultText: "Ta régularité et ton sérieux sont justement ce que recherchait ce recruteur.",
      },
    ],
  },
  {
    id: 'evt_social_night',
    title: 'Soirée d\'équipe',
    body: "Tes coéquipiers organisent une sortie la veille d'un match secondaire du calendrier.",
    choices: [
      {
        id: 'social_go',
        text: "Y aller pour resserrer les liens avec le groupe",
        effect: { charisma: 2, morale: 4, energy: -2 },
        resultText: "Super ambiance, la cohésion d'équipe s'en ressent sur le terrain.",
      },
      {
        id: 'social_skip',
        text: "Rester chez toi pour te concentrer sur la préparation",
        effect: { iq: 1, energy: 3 },
        resultText: "Tu arrives reposé et concentré, mais certains coéquipiers remarquent ton absence.",
      },
    ],
  },
]

export function pickRandomInterstitial(excludeIds: string[]): StoryEvent {
  const pool = INTERSTITIAL_EVENTS.filter((e) => !excludeIds.includes(e.id))
  const source = pool.length > 0 ? pool : INTERSTITIAL_EVENTS
  return source[Math.floor(Math.random() * source.length)]
}
