/**
 * Generate a random password using the web crypto API.
 *
 * @param {number} len Length of the password to generate.
 * @returns {string} A randomly generated password of len.
 */
export default function generatePassword(len = 32) {
  const getBytes = () => {
    const result = new Uint8Array(1);
    window.crypto.getRandomValues(result);
    return result[0];
  };

  return Array.from({ length: len }).map(() => {
    let result = '';
    do {
      result = String.fromCharCode(getBytes());
    } while (/[a-zA-Z0-9_\-+.$#%&^*()!~`]/.test(result) === false);

    return result;
  }).join('');
}
