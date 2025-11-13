export function base64_decode({ content }) {
  return Buffer.from(content, 'base64').toString('utf8');
}
