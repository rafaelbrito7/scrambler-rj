import { redirect } from "next/navigation";

import { signInAsTestAdministrator, signInWithGoogle } from "@/app/actions";
import { canSignIn, isGoogleConfigured, isTestLoginEnabled } from "@/auth";
import { GateScreen } from "@/components/app/gate-screen";
import { LogoIntro } from "@/components/intro/logo-intro";
import { Button } from "@/components/ui/button";
import { safeReturnPath } from "@/server/return-path";
import { getViewer, homeFor } from "@/server/session";

type PageProps = {
  searchParams: Promise<{ voltar?: string }>;
};

export default async function EntryPage({ searchParams }: PageProps) {
  const [viewer, { voltar }] = await Promise.all([getViewer(), searchParams]);
  const returnTo = safeReturnPath(voltar);
  const hasReturnPath = returnTo !== null;
  // Everyone enters here; what an administrator can do comes from the account. Only the test
  // accounts need a second button, because they are two separate accounts.
  const showsTestAdministrator = isTestLoginEnabled && !isGoogleConfigured;

  if (viewer) redirect(returnTo ?? homeFor(viewer));

  return (
    <>
      {/* Plays on every visit by someone who is not signed in. */}
      <LogoIntro />
      <GateScreen title="Área dos riders">
        <p className="mt-4 leading-relaxed text-cream-dim">
          Entre com sua conta Google. Se você ainda não é do grupo, o próximo
          passo é pedir ingresso.
        </p>

        <form action={signInWithGoogle} className="mt-8">
          {hasReturnPath && <input type="hidden" name="voltar" value={returnTo} />}
          <Button type="submit" disabled={!canSignIn} className="w-full">
            Entrar com Google
          </Button>
        </form>
        {showsTestAdministrator && (
          <form action={signInAsTestAdministrator} className="mt-3">
            {hasReturnPath && <input type="hidden" name="voltar" value={returnTo} />}
            <Button type="submit" variant="ghost" className="w-full">
              Entrar como administrador de teste
            </Button>
            <p className="mt-1 text-center text-sm text-cream-dim">
              Só neste ambiente de desenvolvimento.
            </p>
          </form>
        )}
        {!canSignIn && (
          <p className="mt-3 text-sm leading-relaxed text-cream-dim">
            O login com Google ainda não foi configurado neste ambiente.
          </p>
        )}
      </GateScreen>
    </>
  );
}
