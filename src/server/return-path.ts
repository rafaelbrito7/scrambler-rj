const campaignPath = /^\/(vestuario|passeios)\/[a-z0-9]+$/;

// Only campaign pages inside this site are accepted, so a crafted link can never send a
// person somewhere else after signing in.
export function safeReturnPath(candidate: string | null | undefined) {
  return candidate && campaignPath.test(candidate) ? candidate : null;
}
