export default function VotePage({ params }: { params: { eventId: string } }) {
  return <div>Äänestys tapahtumalle {params.eventId}</div>;
}
