import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Progress,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import React, { useState } from "react";
import useGetVotingParticipation from "../api/useGetVotingParticipation.hook";

export default function VotingParticipation({ eventId }: { eventId: number }) {
  const [round, setRound] = useState<number | null>(null);
  const { data, isPending, isError, refetch, isFetching } =
    useGetVotingParticipation(eventId, round);

  return (
    <Paper withBorder p="md" my="md">
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Äänestysaktiivisuus</Title>
          <Button
            variant="light"
            onClick={() => refetch()}
            loading={isFetching}
          >
            Päivitä
          </Button>
        </Group>
        {isPending ? (
          <Loader />
        ) : isError ? (
          <Alert color="red">
            Äänestysaktiivisuuden lataaminen epäonnistui.
          </Alert>
        ) : (
          <>
            <Select
              label="Äänestyskierros"
              value={String(data.votingRound)}
              onChange={(value) => setRound(value ? Number(value) : null)}
              data={Array.from({ length: data.currentRound }, (_, index) => ({
                value: String(index + 1),
                label: `Kierros ${index + 1}${index + 1 === data.currentRound ? " (seuraava laskettava)" : " (laskettu)"}`,
              }))}
            />
            <Alert
              color={
                !data.roundOutlook.hasVotes
                  ? "gray"
                  : data.roundOutlook.additionalRoundNeeded
                    ? "yellow"
                    : "green"
              }
              title="Lisäkierrosten tarve"
            >
              <Stack gap="xs">
                <Text size="sm">
                  {!data.roundOutlook.hasVotes
                    ? "Tällä kierroksella ei ole vielä ääniä. Lisäkierrosten tarvetta ei voida arvioida."
                    : data.roundOutlook.additionalRoundNeeded
                      ? "Nykytilanteessa tarvitaan vähintään yksi lisäkierros. Varaa aikaa lisä-äänestyksille."
                      : "Nykytilanteessa lisäkierrosta ei tarvita."}
                </Text>
                {data.roundOutlook.tiedCandidateCount > 0 && (
                  <Text size="sm">
                    Ratkaisua vaativa tasatilanne:{" "}
                    {data.roundOutlook.tiedCandidateCount} ehdokasta kilpailee{" "}
                    {data.roundOutlook.tiedSlotCount} paikasta.
                  </Text>
                )}
                {data.roundOutlook.groupDeciderCount > 0 && (
                  <Text size="sm">
                    Ratkaisukierrosta odottavia peliryhmiä:{" "}
                    {data.roundOutlook.groupDeciderCount}.
                  </Text>
                )}
                <Text size="sm" c="dimmed">
                  Arvio perustuu valitun kierroksen tämänhetkisiin ääniin ja voi
                  muuttua äänestyksen aikana. Pelien nimiä tai äänimääriä ei
                  näytetä.
                </Text>
              </Stack>
            </Alert>
            <Text fw={600}>
              Vähintään yksi ääni: {data.votedCount} / {data.participantCount} (
              {data.votePercentage.toLocaleString("fi-FI")} %)
            </Text>
            <Text fw={600}>
              Kaikki äänet käytetty: {data.completedCount} /{" "}
              {data.participantCount}
            </Text>
            <Progress
              value={data.votePercentage}
              aria-label="Äänestäneiden osuus"
            />
            <Text size="sm" c="dimmed">
              Tällä kierroksella jokainen ilmoittautunut voi käyttää enintään{" "}
              {data.maxVotes} ääntä. Edistymispalkki näyttää vähintään yhden
              äänen antaneiden osuuden.
            </Text>
            {data.users.length === 0 ? (
              <Text>Ei ilmoittautuneita.</Text>
            ) : (
              <Table.ScrollContainer minWidth={300}>
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Osallistuja</Table.Th>
                      <Table.Th>Ääniä käytetty</Table.Th>
                      <Table.Th>Tila</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {data.users.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          {user.nickname
                            ? `${user.nickname} (${user.username})`
                            : user.username}
                        </Table.Td>
                        <Table.Td>
                          {user.voteCount} / {data.maxVotes}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              !user.hasVoted
                                ? "gray"
                                : data.maxVotes > 0 &&
                                    user.voteCount >= data.maxVotes
                                  ? "green"
                                  : "yellow"
                            }
                          >
                            {!user.hasVoted
                              ? "Ei ääniä"
                              : data.maxVotes > 0 &&
                                  user.voteCount >= data.maxVotes
                                ? "Kaikki käytetty"
                                : "Osittain"}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
