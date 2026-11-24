import Image from "next/image";

import logo from "@assets/logo-scrambler-rj.webp";

type GateScreenProps = {
  title: string;
  children: React.ReactNode;
};

// Shared frame of the screens shown before a person is inside the group.
export function GateScreen({ title, children }: GateScreenProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-5 py-12">
      <Image src={logo} alt="Scrambler RJ" width={104} height={104} priority />
      <h1 className="display mt-8 text-[clamp(2rem,8vw,2.75rem)]">{title}</h1>
      {children}
    </main>
  );
}
