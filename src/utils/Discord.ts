/**
 * Should we ignore audio/commands from this user?
 *
 * @param {string} userId
 * @returns {boolean}
 */
export const shouldExcludeUser = (userId: string): boolean => {
  return process.env.IGNORED_USERS.split(",").indexOf(userId) == -1;
};
