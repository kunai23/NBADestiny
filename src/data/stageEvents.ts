import type { StoryEvent } from '../types'

export const STAGE_TRANSITION_EVENTS: Record<string, StoryEvent> = {
  transition_us_hs_to_college: {
    id: 'transition_us_hs_to_college',
    title: 'Lettres de recrutement',
    body: "Ta première saison de lycée est derrière toi. Plusieurs universités t'envoient des offres de bourse. Comment choisis-tu ton futur programme ?",
    choices: [
      {
        id: 'college_big_program',
        text: "Rejoindre un grand programme universitaire réputé, quitte à être moins utilisé",
        effect: { reputation: 4, morale: -2 },
        resultText: "Tu rejoins un programme prestigieux, sous les projecteurs dès le premier jour.",
      },
      {
        id: 'college_playing_time',
        text: "Choisir un programme plus modeste où tu seras titulaire indiscutable",
        effect: { iq: 2, charisma: 1 },
        resultText: "Tu choisis le temps de jeu plutôt que le prestige. Un pari sur ta progression.",
      },
    ],
  },
  transition_us_college_to_draft: {
    id: 'transition_us_college_to_draft',
    title: 'Soirée de la Draft',
    body: "Après ta saison universitaire, ton nom circule dans les mock drafts. Le grand soir est arrivé : la Draft NBA.",
    choices: [
      {
        id: 'draft_declare',
        text: "Déclarer ta candidature et vivre le rêve NBA dès maintenant",
        effect: { reputation: 5, charisma: 2 },
        resultText: "Ton nom est appelé ! Tu rejoins la NBA, prêt à écrire ta légende.",
      },
      {
        id: 'draft_confident',
        text: "Rester concentré sur le travail malgré la pression médiatique",
        effect: { iq: 2, morale: 3 },
        resultText: "Tu gardes la tête froide durant tout le processus. Une franchise NBA t'appelle finalement.",
      },
    ],
  },
  transition_euro_academy1_to_academy2: {
    id: 'transition_euro_academy1_to_academy2',
    title: 'Bilan de première année',
    body: "Le club évalue ta progression après ta première saison en académie. Le staff technique te propose un nouvel axe de travail pour l'an prochain.",
    choices: [
      {
        id: 'academy_technical',
        text: "Se concentrer sur le raffinement technique individuel",
        effect: { shooting: 2, iq: 1 },
        resultText: "Ton jeu gagne en finesse. Les entraîneurs saluent ta maturité technique.",
      },
      {
        id: 'academy_physical',
        text: "Prioriser le développement physique pour rivaliser avec les seniors",
        effect: { athleticism: 2, defense: 1 },
        resultText: "Tu prends une nouvelle dimension physique, prêt à affronter des joueurs plus âgés.",
      },
    ],
  },
  transition_euro_academy2_to_draft: {
    id: 'transition_euro_academy2_to_draft',
    title: 'Premier contrat professionnel',
    body: "Le club te propose de signer ton premier contrat professionnel. C'est le moment de passer un cap dans ta carrière.",
    choices: [
      {
        id: 'euro_sign_home',
        text: "Signer avec le club formateur pour poursuivre ta progression sur place",
        effect: { reputation: 3, morale: 4 },
        resultText: "Tu signes professionnel avec le club qui t'a vu grandir. La confiance est totale.",
      },
      {
        id: 'euro_sign_bigger',
        text: "Négocier un transfert vers un club plus huppé de l'EuroLigue",
        effect: { reputation: 5, morale: -1 },
        resultText: "Tu rejoins un club ambitieux d'EuroLigue, prêt à te lancer un défi plus relevé.",
      },
    ],
  },
}

export const PRO_SEASON_CONTINUE_EVENT: StoryEvent = {
  id: 'transition_pro_continue',
  title: 'Bilan de fin de saison',
  body: "Une nouvelle saison professionnelle vient de s'achever. C'est l'heure de faire le point sur la suite de ta carrière.",
  choices: [
    {
      id: 'pro_continue',
      text: "Continuer l'aventure pour une saison supplémentaire",
      effect: {},
      resultText: "Tu signes pour une saison de plus. La légende continue de s'écrire.",
    },
    {
      id: 'pro_retire',
      text: "Raccrocher les baskets et clore ta carrière ici",
      effect: { flag: 'retire' },
      resultText: "Tu annonces ta retraite. Le temps est venu de regarder ce que tu as accompli.",
    },
  ],
}
