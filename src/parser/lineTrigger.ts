/**
 * Heuristics to decide if a line contains an intent phrase rather than real code.
 * Returns true if the line passes all the heuristics.
 */
export function shouldTrigger(line: string): boolean {
  const trimmed = line.trim();
  
  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.length >= 60) {
    return false;
  }

  const codeStarts = [
    '{', '}', ';', '(', ')', '=', '+', '-', '*', '/', '#',
    'import', 'include'
  ];
  if (codeStarts.some((token) => trimmed.startsWith(token))) {
    return false;
  }

  const ends = [';', '{', ','];
  if (ends.some((char) => trimmed.endsWith(char))) {
    return false;
  }

  const pairs = [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' }
  ];
  
  for (const pair of pairs) {
    if (trimmed.includes(pair.open) && trimmed.includes(pair.close)) {
      return false;
    }
  }

  return true;
}
