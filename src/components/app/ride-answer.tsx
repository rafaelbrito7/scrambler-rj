"use client";

import { useActionState, useState } from "react";

import { type RideAnswerState, respondToRide } from "@/app/passeios/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RideAnswer as Answer } from "@/server/rides";

type RideAnswerProps = {
  rideId: string;
  route: string;
  answer: Answer | null;
};

const idleState: RideAnswerState = { error: null };

const answerLabels: Record<Answer, string> = {
  GOING: "Você vai",
  NOT_GOING: "Você não vai",
};

// Answers in place, on the home card and on the ride page. The parent keys it by the saved
// answer, so a saved change remounts it back into the settled view.
export function RideAnswer({ rideId, route, answer }: RideAnswerProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [state, formAction, isPending] = useActionState(respondToRide, idleState);
  const hasAnswered = answer !== null;
  const hasError = state.error !== null;
  const showsChoices = !hasAnswered || isChanging;
  const showsSettled = hasAnswered && !isChanging;
  // Orange marks only what is still waiting on the person; changing a given answer is quiet.
  const goingVariant = hasAnswered ? "outline" : "default";
  // The saved answer stays filled and cannot be sent again.
  const savedClasses =
    "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:opacity-100";

  return (
    <div>
      {showsSettled && (
        <div className="flex items-center justify-between gap-4">
          <Badge variant={answer === "GOING" ? "default" : "outline"}>{answerLabels[answer]}</Badge>
          <Button type="button" variant="ghost" size="inline" onClick={() => setIsChanging(true)}>
            Trocar<span className="sr-only"> resposta de {route}</span>
          </Button>
        </div>
      )}
      {showsChoices && (
        <form action={formAction}>
          <input type="hidden" name="rideId" value={rideId} />
          <p className="font-semibold">
            {hasAnswered ? "Trocar resposta" : "Você ainda não respondeu"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              type="submit"
              name="answer"
              value="GOING"
              variant={goingVariant}
              disabled={isPending || answer === "GOING"}
              aria-pressed={answer === "GOING"}
              className={savedClasses}
            >
              Vou<span className="sr-only"> a {route}</span>
            </Button>
            <Button
              type="submit"
              name="answer"
              value="NOT_GOING"
              variant="outline"
              disabled={isPending || answer === "NOT_GOING"}
              aria-pressed={answer === "NOT_GOING"}
              className={savedClasses}
            >
              Não vou<span className="sr-only"> a {route}</span>
            </Button>
          </div>
          {hasAnswered && (
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => setIsChanging(false)}
              className="mt-2 w-full"
            >
              Manter resposta
            </Button>
          )}
        </form>
      )}
      {hasError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </div>
  );
}
