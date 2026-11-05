/*
  Online service placeholder.

  Real accounts, saved villages, friends, and clans need a secure
  online server and database. Never put passwords or admin secrets
  directly in the game files.
*/

export const ONLINE_READY = false;

export async function createAccount() {
  throw new Error('Online accounts are not connected in this prototype.');
}

export async function signIn() {
  throw new Error('Online accounts are not connected in this prototype.');
}

export async function saveVillage() {
  throw new Error('Online saves are not connected in this prototype.');
}
