export const votingStates = [
  { value: "0", label: "Ei" },
  { value: "1", label: "Kyllä" },
  { value: "2", label: "Ääntenlaskenta" },
  { value: "3", label: "Tulokset" },
];

export function getVotingState(votingState: number) {
  const state = votingStates.find(
    (state) => state.value === votingState.toString(),
  );
  if (state) {
    switch (votingState) {
      case 0:
        return state.label;
      case 1:
        return state.label;
      case 2:
        return state.label;
      case 3:
        return state.label;
      default:
        return "Ei";
    }
  }
  return "Ei";
}
