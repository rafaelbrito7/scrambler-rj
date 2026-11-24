import type { Metadata } from "next";

import { ProfileForm } from "@/app/perfil/editar/profile-form";
import { clearEmergencyData } from "@/app/perfil/actions";
import { birthdayInputValue } from "@/server/profile-options";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { ConfirmAction } from "@/components/app/confirm-action";
import { Avatar } from "@/components/app/avatar";
import { formatWhatsapp } from "@/components/app/format";
import { access, profiles } from "@/server/services";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Editar perfil | Scrambler RJ" };

export default async function EditProfilePage() {
  const viewer = await requireState("approved");
  const [profile, pendingCount] = await Promise.all([
    profiles.getOwnProfile(viewer.userId),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);

  const hasEmergencyData = [
    profile.emergencyName,
    profile.emergencyPhone,
    profile.bloodType,
    profile.emergencyName2,
    profile.emergencyPhone2,
    profile.healthPlan,
    profile.healthPlanCard,
    profile.healthNotes,
  ].some((value) => value !== null);

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <BackLink href="/perfil">Meu perfil</BackLink>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">Editar perfil</h1>

      <ProfileForm
        currentPhoto={<Avatar person={profile} size="lg" />}
        hasPhoto={profile.photoKey !== null}
        initial={{
          fullName: profile.fullName,
          nickname: profile.nickname ?? "",
          instagram: profile.instagram ? `@${profile.instagram}` : "",
          region: profile.region ?? "",
          experience: profile.experience ?? "",
          bio: profile.bio ?? "",
          birthday: birthdayInputValue(profile.birthday),
          whatsapp: formatWhatsapp(profile.whatsapp),
          shirtSize: profile.shirtSize ?? "",
          emergencyName: profile.emergencyName ?? "",
          emergencyPhone: profile.emergencyPhone ? formatWhatsapp(profile.emergencyPhone) : "",
          bloodType: profile.bloodType ?? "",
          emergencyName2: profile.emergencyName2 ?? "",
          emergencyPhone2: profile.emergencyPhone2 ? formatWhatsapp(profile.emergencyPhone2) : "",
          healthPlan: profile.healthPlan ?? "",
          healthPlanCard: profile.healthPlanCard ?? "",
          healthNotes: profile.healthNotes ?? "",
        }}
      />

      {hasEmergencyData && (
        <div className="mt-10 max-w-2xl">
          <ConfirmAction
            label="Apagar dados de emergência"
            question="Apagar todos os dados de emergência do seu perfil: contatos, tipo sanguíneo, plano de saúde e alergias? O resto do perfil fica como está."
            confirmLabel="Sim, apagar"
            keepLabel="Manter dados"
            action={clearEmergencyData}
            fields={{}}
          />
        </div>
      )}
    </AppShell>
  );
}
