import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface VotingParticipation {
  votingRound: number;
  currentRound: number;
  maxVotes: number;
  participantCount: number;
  votedCount: number;
  completedCount: number;
  votePercentage: number;
  roundOutlook: {
    hasVotes: boolean;
    additionalRoundNeeded: boolean;
    tiedCandidateCount: number;
    tiedSlotCount: number;
    groupDeciderCount: number;
  };
  users: {
    id: number;
    username: string;
    nickname: string | null;
    hasVoted: boolean;
    voteCount: number;
  }[];
}

export default function useGetVotingParticipation(
  eventId: number,
  round: number | null,
) {
  return useQuery({
    queryKey: ["voting_participation", eventId, round],
    queryFn: async () => {
      const response = await axios.get<{ data: VotingParticipation }>(
        `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/api/admin/events/${eventId}/voting-participation`,
        { withCredentials: true, params: round === null ? {} : { round } },
      );
      return response.data.data;
    },
    refetchInterval: 30_000,
  });
}
