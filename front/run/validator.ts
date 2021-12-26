const MAX = 32;
const MIN = 2;

export const validateUsername = (username?: string): boolean => {
  if (!username || username.length > MAX || username.length < MIN) {
    return false;
  }
  return (/^[a-zA-Z0-9]{2,32}$/).test(username);
};
