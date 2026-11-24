import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { addBikeModel, changeBikeModel, saveBikeModel } from "@/app/painel/riders/modelos/actions";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BIKE_MODEL_NAME_MAX_LENGTH } from "@/server/bike-models";
import { access, bikeModels } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Modelos de moto | Scrambler RJ" };

const notices: Record<string, string> = {
  incluido: "Modelo incluído. Já pode ser escolhido no pedido de ingresso e no perfil.",
  salvo: "Modelo atualizado, também nas motos que o usam.",
  movido: "Ordem atualizada.",
  desativado: "Modelo desativado. As motos que já o usam continuam mostrando.",
  ativado: "Modelo reativado.",
};

const problems: Record<string, string> = {
  invalido: `Nada foi salvo. Dê um nome de 2 a ${BIKE_MODEL_NAME_MAX_LENGTH} caracteres e a cilindrada em números, por exemplo 900.`,
  repetido: "Nada foi salvo. Já existe na lista um modelo com esse nome, ou com um nome que se confunde com ele.",
  mudou: "A lista já tinha mudado. Confira abaixo.",
};

type PageProps = { searchParams: Promise<{ aviso?: string }> };

export default async function BikeModelsPage({ searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ aviso }, models, pendingCount] = await Promise.all([
    searchParams,
    bikeModels.listAll(viewer.userId),
    access.countPending(viewer.userId),
  ]);
  const notice = aviso ? notices[aviso] : undefined;
  const problem = aviso ? problems[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const hasProblem = problem !== undefined;

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/riders">Gestão de riders</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Modelos de moto</h1>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-cream-dim">
        O que o rider escolhe no pedido de ingresso e ao cadastrar uma moto, na ordem daqui. Quem
        tem outra moto continua podendo escolher “Outro” e digitar.
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
        {models.map((model, index) => {
          const isFirst = index === 0;
          const isLast = index === models.length - 1;
          const isInactive = !model.active;
          const nextChange = isInactive ? "ativar" : "desativar";
          const nextChangeLabel = isInactive ? "Reativar" : "Desativar";

          return (
            <li key={model.id} className="min-w-0 rounded-sm bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="truncate font-semibold">{model.name}</span>
                  <span className="text-sm text-cream-dim">{model.engineSize} cilindradas</span>
                  {isInactive && <Badge variant="outline">Desativado</Badge>}
                </p>
                <form action={changeBikeModel} className="flex shrink-0 items-center gap-2">
                  <input type="hidden" name="modelId" value={model.id} />
                  <Button
                    type="submit"
                    name="change"
                    value="subir"
                    variant="outline"
                    size="icon"
                    disabled={isFirst}
                    aria-label={`Subir ${model.name}`}
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
                    aria-label={`Descer ${model.name}`}
                  >
                    <ArrowDownIcon aria-hidden />
                  </Button>
                </form>
              </div>

              <form
                action={saveBikeModel}
                className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end"
              >
                <input type="hidden" name="modelId" value={model.id} />
                <Field>
                  <FieldLabel htmlFor={`name-${model.id}`}>Nome</FieldLabel>
                  <Input
                    id={`name-${model.id}`}
                    name="name"
                    defaultValue={model.name}
                    maxLength={BIKE_MODEL_NAME_MAX_LENGTH}
                    autoComplete="off"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`engine-${model.id}`}>Cilindrada</FieldLabel>
                  <Input
                    id={`engine-${model.id}`}
                    name="engineSize"
                    defaultValue={model.engineSize}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </Field>
                <Button type="submit" variant="outline">
                  Salvar<span className="sr-only"> {model.name}</span>
                </Button>
              </form>

              <form action={changeBikeModel} className="mt-3">
                <input type="hidden" name="modelId" value={model.id} />
                <Button type="submit" name="change" value={nextChange} variant="ghost" size="inline">
                  {nextChangeLabel}
                  <span className="sr-only"> {model.name}</span>
                </Button>
              </form>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="new-model-title" className="mt-12 max-w-2xl">
        <h2 id="new-model-title" className="label border-b border-border pb-3 text-foreground">
          Novo modelo
        </h2>
        <form action={addBikeModel} className="mt-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-name">Nome</FieldLabel>
              <Input
                id="new-name"
                name="name"
                maxLength={BIKE_MODEL_NAME_MAX_LENGTH}
                placeholder="Scrambler 1200 XE"
                autoComplete="off"
                aria-describedby="new-name-hint"
              />
              <FieldDescription id="new-name-hint">
                Como o grupo chama o modelo, sem “Triumph” e sem a cilindrada repetida.
              </FieldDescription>
            </Field>
            <Field className="sm:max-w-40">
              <FieldLabel htmlFor="new-engine">Cilindrada</FieldLabel>
              <Input id="new-engine" name="engineSize" inputMode="numeric" placeholder="1200" autoComplete="off" />
            </Field>
            <Button type="submit" className="w-full sm:w-fit">
              Incluir modelo
            </Button>
          </FieldGroup>
        </form>
      </section>
    </AppShell>
  );
}
