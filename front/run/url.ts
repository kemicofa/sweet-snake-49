export const baseUrl = 'https://sweet-snake-49.deno.dev';

/**
 * 
 * Method that builds a full  url using a partial one.
 * 
 * @param uri
 * @returns 
 */
export const buildUrl = (uri: string) => `${baseUrl}/${uri}`;