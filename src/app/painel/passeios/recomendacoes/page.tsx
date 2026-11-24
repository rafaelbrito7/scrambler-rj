import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { addTip, changeTip, saveTip } from "@/app/painel/passeios/recomendacoes/actions";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { TipIcon } from "@/components/app/tip-icon";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TIP_ICONS, TIP_TEXT_MAX_LENGTH } from "@/server/ride-options";
import { access, rides } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Recomendações | Scrambler RJ" };

const notices: Record<string, string> = {
  incluida: "Recomendação incluída. Já pode ser marcada nos passeios.",
  salva: "Recomendação atualizada, também nos passeios que a usam.",
  movida: "Ordem atualizada.",
  desativada: "Recomendação desativada. Os passeios que já a usam continuam mostrando.",
  ativada: "Recomendação reativada.",
};

const problems: Record<string, string> = {
  invalida: `Nada foi salvo. Escreva a recomendação em até ${TIP_TEXT_MAX_LENGTH} caracteres e escolha um ícone.`,
  mudou: "A lista já tinha mudado. Confira abaixo.",
};

type PageProps = { searchParams: Promise<{ aviso?: string }> };

function IconSelect({ id, value }: { id: string; value: string }) {
  return (
    <NativeSelect id={id} name="icon" defaultValue={value}>
      {TIP_ICONS.map((icon) => (
        <NativeSelectOption key={icon.value} value={icon.value}>
          {icon.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

export default async function RideTipsPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, tips, pendingCount] = await Promise.all([
    searchParams,
    rides.listTips(viewer.userId),
    access.countPending(viewer.userId),
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const problem = aviso ? problems[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasProblem = problem !== undefined;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/passeios">Passeios</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Recomendações</h1>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
        O que você pode marcar em “Leve com você” ao publicar um passeio. A ordem daqui é a ordem
        em que aparecem para os riders.
      </p>

      {hasNotice && (
        <Alert role="status" className="mt-5 max-w-2xl">
          {notice}
        </Alert>
      )}
      {hasProblem && (
        <Alert variant="destructive" className="mt-5 max-w-2xl">
          {problem}
        </Alert>
      )}

      <ul className="mt-8 grid max-w-2xl grid-cols-1 gap-3">
        {tips.map((tip, index) => {
          const isFirst = index === 0;
          const isLast = index === tips.length - 1;
          const isInactive = !tip.active;

          return (
            <li key={tip.id} className="min-w-0 rounded-sm bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex min-w-0 items-center gap-3">
                  <TipIcon name={tip.icon} className="size-6 shrink-0 text-highlight" />
                  <span className="truncate font-semibold">{tip.text}</span>
                  {isInactive && <Badge variant="outline">Desativada</Badge>}
                </p>
                <form action={changeTip} className="flex shrink-0 items-center gap-2">
                  <input type="hidden" name="tipId" value={tip.id} />
                  <Button
                    type="submit"
                    name="change"
                    value="subir"
                    variant="outline"
                    size="icon"
                    disabled={isFirst}
                    aria-label={`Subir ${tip.text}`}
                  >
                    <ArrowUpIcon aria-hidden />
                  </Button>
                  <Button
                    type="submit"
                    name="change"
                    value="descer"
                    variant="outline"
                    size="icon"
                    disabled={isLast}
                    aria-label={`Descer ${tip.text}`}
                  >
                    <ArrowDownIcon aria-hidden />
                  </Button>
                </form>
              </div>

              <form action={saveTip} className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end">
                <input type="hidden" name="tipId" value={tip.id} />
                <Field>
                  <FieldLabel htmlFor={`text-${tip.id}`}>Texto</FieldLabel>
                  <Input
                    id={`text-${tip.id}`}
                    name="text"
                    defaultValue={tip.text}
                    maxLength={TIP_TEXT_MAX_LENGTH}
                    autoComplete="off"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`icon-${tip.id}`}>Ícone</FieldLabel>
                  <IconSelect id={`icon-${tip.id}`} value={tip.icon} />
                </Field>
                <Button type="submit" variant="outline">
                  Salvar<span className="sr-only"> {tip.text}</span>
                </Button>
              </form>

              <form action={changeTip} className="mt-3">
                <input type="hidden" name="tipId" value={tip.id} />
                <Button
                  type="submit"
                  name="change"
                  value={isInactive ? "ativar" : "desativar"}
                  variant="ghost"
                  size="inline"
                >
                  {isInactive ? "Reativar" : "Desativar"}
                  <span className="sr-only"> {tip.text}</span>
                </Button>
              </form>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="new-tip-title" className="mt-12 max-w-2xl">
        <h2 id="new-tip-title" className="label border-b border-border pb-3 text-foreground">
          Nova recomendação
        </h2>
        <form action={addTip} className="mt-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-text">Texto</FieldLabel>
              <Input
                id="new-text"
                name="text"
                maxLength={TIP_TEXT_MAX_LENGTH}
                placeholder="Lanterna de cabeça"
                autoComplete="off"
              />
            </Field>
            <Field className="sm:max-w-56">
              <FieldLabel htmlFor="new-icon">Ícone</FieldLabel>
              <IconSelect id="new-icon" value="check" />
            </Field>
            <Button type="submit" className="w-full sm:w-fit">
              Incluir recomendação
            </Button>
          </FieldGroup>
        </form>
      </section>
    </AppShell>
  );
}
