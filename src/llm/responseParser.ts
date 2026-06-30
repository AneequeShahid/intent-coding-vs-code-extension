export function parseResponse(raw: string): { code: string } | { error: 'no-code-block' | 'multiple-code-blocks' } {
  const regex = /```[a-zA-Z0-9+#-]*[\r\n]+([\s\S]*?)```/g;
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(raw)) !== null) {
    matches.push(match[1].trim());
  }

  if (matches.length === 0) {
    return { error: 'no-code-block' };
  }

  if (matches.length > 1) {
    return { error: 'multiple-code-blocks' };
  }

  return { code: matches[0] };
}
