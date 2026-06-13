/**
 * Generates a random ticket ID in the format: xxxx-xxxx-xxxx-xxxx
 * where each segment is 4 alphanumeric characters (lowercase + digits)
 */
export function generateTicketId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments: string[] = [];

  for (let s = 0; s < 4; s++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join('-');
}
