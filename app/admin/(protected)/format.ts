/* Admin timestamps, always in KIBA's own time zone (Central) so a log entry
   reads the same no matter where the server or the reader is. */
const WHEN = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  dateStyle: 'medium',
  timeStyle: 'short'
});

export function formatWhen(d: Date): string {
  return `${WHEN.format(d)} CT`;
}
