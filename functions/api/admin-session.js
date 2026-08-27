/* Unified MedLife admin session endpoint.
   The administration login and the articles dashboard now use the same
   member_accounts + member_sessions authentication system and the same
   secure session cookie.
*/
import { onRequest as articlesSession } from './article-admin-session.js';

export async function onRequest(context) {
  return articlesSession(context);
}
