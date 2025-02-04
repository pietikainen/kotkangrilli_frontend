export default function roundToNearestMinute(date: Date): Date {
  const roundedDate = new Date(date);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  const minutes = roundedDate.getMinutes();
  const roundedMinutes = Math.round(minutes);
  roundedDate.setMinutes(roundedMinutes);
  return roundedDate;
}
