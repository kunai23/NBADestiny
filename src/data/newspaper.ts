export const NEWSPAPER_NAMES = [
  "L'Écho du Panier",
  'SLAM Chronicle',
  'Basket Hebdo',
  'The Hardwood Times',
  'Le Parquet Libre',
  'Courtside Gazette',
]

export const SATIRICAL_NEWS = [
  "Ailleurs dans l'actu : un pigeon a interrompu un match pendant douze minutes après s'être posé sur le cercle.",
  "Ailleurs dans l'actu : la mascotte locale réclame une augmentation et menace de faire grève avant les playoffs.",
  "Ailleurs dans l'actu : un supporter a prédit le score exact du match... en dormant devant sa télé.",
  "Ailleurs dans l'actu : le hot-dog de la salle est élu \"MVP officieux\" de la soirée par des fans affamés.",
  "Ailleurs dans l'actu : la Wi-Fi de la salle est tombée en panne, des centaines de fans forcés de regarder le match en vrai.",
  "Ailleurs dans l'actu : un enfant de huit ans bat le champion du concours de tirs à mi-temps devant un stade médusé.",
  "Ailleurs dans l'actu : le t-shirt cannon a explosé sans faire de blessé, mais tout le monde repart avec un t-shirt.",
  "Ailleurs dans l'actu : un arbitre confond deux joueurs aux noms similaires pendant tout le quatrième quart-temps.",
  "Ailleurs dans l'actu : la sono diffuse par erreur la playlist du mariage de l'organisateur pendant l'entrée des joueurs.",
]

export function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function generateHeadline(wins: number, losses: number, isMvp: boolean, playerName: string): string {
  const total = wins + losses
  const winPct = total > 0 ? wins / total : 0
  if (isMvp) return `${playerName} survole la ligue et rafle le titre de MVP !`
  if (winPct >= 0.75) return `${playerName} et les siens impressionnent toute la ligue`
  if (winPct >= 0.55) return `Une saison solide pour ${playerName}`
  if (winPct >= 0.4) return `${playerName} dans la tourmente d'une saison irrégulière`
  return `Saison à oublier pour ${playerName} et son équipe`
}
