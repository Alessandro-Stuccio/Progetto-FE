/**
 * Helper sull'utente riusati da più tab.
 * Le iniziali (per gli avatar a cerchietto) erano calcolate allo stesso identico modo
 * in home, admin-home, insurance, documenti admin e nella dashboard: una funzione sola.
 */

/** Iniziali maiuscole da nome e cognome, es. "Mario Rossi" -> "MR". Tollera campi mancanti. */
export function getInitials(user: { firstName?: string; lastName?: string } | null | undefined): string {
  const f = (user?.firstName ?? '').charAt(0);
  const l = (user?.lastName ?? '').charAt(0);
  return (f + l).toUpperCase();
}
