import type { Icon } from "@phosphor-icons/react";
import {
  BackpackIcon,
  BatteryChargingIcon,
  CameraIcon,
  CheckCircleIcon,
  CoinsIcon,
  DropIcon,
  FirstAidKitIcon,
  ForkKnifeIcon,
  GasPumpIcon,
  HardHatIcon,
  HoodieIcon,
  IdentificationCardIcon,
  LinkSimpleIcon,
  SunIcon,
  TireIcon,
  UmbrellaIcon,
  WavesIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";

// The pictures behind the icon names in TIP_ICONS. An unknown name falls back to a plain check,
// so a recommendation never renders without its mark.
const icons: Record<string, Icon> = {
  fuel: GasPumpIcon,
  tyre: TireIcon,
  chain: LinkSimpleIcon,
  document: IdentificationCardIcon,
  money: CoinsIcon,
  food: ForkKnifeIcon,
  rain: UmbrellaIcon,
  warm: HoodieIcon,
  gear: HardHatIcon,
  water: DropIcon,
  sun: SunIcon,
  tools: WrenchIcon,
  swim: WavesIcon,
  battery: BatteryChargingIcon,
  firstaid: FirstAidKitIcon,
  camera: CameraIcon,
  bag: BackpackIcon,
  check: CheckCircleIcon,
};

export function TipIcon({ name, className }: { name: string; className?: string }) {
  const Glyph = icons[name] ?? CheckCircleIcon;

  return <Glyph aria-hidden className={className} />;
}
