import { add, Duration } from 'date-fns';

export function generateExpirationDate(
  duration: Duration | number = { hours: 2 },
) {
  return typeof duration === 'number'
    ? add(Date.now(), {
        minutes: duration,
      }).toISOString()
    : add(Date.now(), duration).toISOString();
}
