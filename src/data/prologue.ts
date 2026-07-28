import type { StoryEvent } from '../types'

export const PROLOGUE_EVENTS: StoryEvent[] = [
  {
    id: 'prologue_origin',
    title: 'Le point de départ',
    body: "Le ballon rebondit sur l'asphalte depuis que tu es enfant. Aujourd'hui commence vraiment ton histoire. Où as-tu grandi, et où vas-tu tenter ta chance ?",
    choices: [
      {
        id: 'origin_usa',
        text: "Aux États-Unis, sur les playgrounds et dans les gymnases de lycée",
        effect: { athleticism: 2, charisma: 1, flag: 'origin_usa' },
        resultText: "Tu choisis la voie américaine : lycée, université, puis la Draft NBA. Le chemin est long mais légendaire.",
      },
      {
        id: 'origin_europe',
        text: "En Europe, formé dans une académie de club professionnel",
        effect: { iq: 2, defense: 1, flag: 'origin_europe' },
        resultText: "Tu choisis la voie européenne : académie de club, montée en équipe pro, et peut-être un jour l'EuroLigue... ou plus loin.",
      },
    ],
  },
  {
    id: 'prologue_training',
    title: 'Tes premières heures d\'entraînement',
    body: "Avant même la compétition, il faut choisir ce que tu travailles sans relâche, chaque matin avant l'école ou l'entraînement collectif.",
    choices: [
      {
        id: 'training_shoot',
        text: "Des milliers de tirs, encore et encore, jusqu'à ce que le geste soit parfait",
        effect: { shooting: 3, energy: -2 },
        resultText: "Ton tir devient une arme redoutable. Les shoot-around n'ont plus de secret pour toi.",
      },
      {
        id: 'training_iq',
        text: "Étudier le jeu : vidéos, lecture de défense, prise de décision",
        effect: { iq: 3, playmaking: 1 },
        resultText: "Tu développes une lecture du jeu rare pour ton âge. Les coachs remarquent ton sens du jeu.",
      },
      {
        id: 'training_athletic',
        text: "Explosivité et vitesse : sprints, détente verticale, gainage",
        effect: { athleticism: 3, defense: 1 },
        resultText: "Ton corps devient une machine. Tu voles au-dessus du cercle et couvres le terrain en un éclair.",
      },
    ],
  },
  {
    id: 'prologue_mentor',
    title: 'Une rencontre déterminante',
    body: "Un ancien joueur, aujourd'hui entraîneur du quartier, t'observe depuis plusieurs semaines. Il t'aborde après un entraînement et te propose un choix.",
    choices: [
      {
        id: 'mentor_leader',
        text: "Accepter de devenir le capitaine informel du groupe, pour apprendre à porter une équipe",
        effect: { charisma: 3, morale: 5 },
        resultText: "Tu apprends à galvaniser tes coéquipiers. Ton leadership naissant impressionne déjà.",
      },
      {
        id: 'mentor_defense',
        text: "Lui demander de t'enseigner les fondamentaux défensifs qu'il maîtrisait en pro",
        effect: { defense: 3, iq: 1 },
        resultText: "Tu apprends les appuis, l'anticipation, la lecture des trajectoires. Ta défense progresse enfin.",
      },
    ],
  },
]
