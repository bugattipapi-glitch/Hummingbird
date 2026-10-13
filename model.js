export function calculateCapacity(reviews, baselineMinutes, pilotMinutes) {
  const values = [reviews, baselineMinutes, pilotMinutes].map(Number);
  if (values.some(value => !Number.isFinite(value) || value < 0)) throw new RangeError('Capacity inputs must be non-negative finite numbers.');
  const minutesSaved = values[1] - values[2];
  const hours = values[0] * minutesSaved / 60;
  return {minutesSaved, hours, roundedHours: Math.round(Math.abs(hours) / 10) * 10};
}
