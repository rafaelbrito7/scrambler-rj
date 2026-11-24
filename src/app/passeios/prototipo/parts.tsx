// PROTÓTIPO DESCARTÁVEL: dados fictícios e peças comuns às variantes.
import { Button } from "@/components/ui/button";

export const ride = {
  title: "Serra de Petrópolis pela estrada velha",
  day: "Sábado, 12 de dezembro",
  meetAt: "7h00",
  leaveAt: "7h30",
  returnAt: "15h30",
  description:
    "Subida pela Estrada Velha da Estrela, almoço em Itaipava e volta pela BR-040. Ritmo de passeio, com parada para foto no mirante.",
  requirements: "Tanque cheio na saída. Capa de chuva na mochila.",
  planB: "Com chuva forte na serra, o passeio vira café em Guapimirim, mesmo horário.",
  going: 14,
  notGoing: 3,
  waiting: 9,
};

export const sheet = [
  { label: "Distância", value: "142 km" },
  { label: "Tempo de rolé", value: "3h20" },
  { label: "Piso", value: "Asfalto" },
  { label: "Dificuldade", value: "Moderado" },
  { label: "Pedágios", value: "R$ 14" },
];

export const stops = [
  { kind: "Encontro", name: "Posto Shell da Washington Luís", place: "Duque de Caxias", time: "7h00", note: "Saída 7h30 em ponto." },
  { kind: "Abastecimento", name: "Posto do Belvedere", place: "Pé da serra", time: "8h10", note: "Último posto antes da subida." },
  { kind: "Mirante", name: "Mirante do Cristo", place: "Estrada Velha da Estrela", time: "9h00", note: "Foto do grupo." },
  { kind: "Café", name: "Casa do Alemão", place: "Quitandinha, Petrópolis", time: "9h40", note: "" },
  { kind: "Destino", name: "Almoço em Itaipava", place: "Estrada União e Indústria", time: "12h00", note: "Cada um paga o seu." },
  { kind: "Retorno", name: "Chegada ao Rio", place: "BR-040", time: "15h30", note: "" },
];


export const weather = [
  { where: "No encontro, 7h", temp: "22°", rain: "10% de chuva" },
  { where: "No destino, 12h", temp: "17°", rain: "35% de chuva" },
];

export function RouteMap({ className = "" }: { className?: string }) {
  const points = [
    [40, 250],
    [120, 215],
    [190, 150],
    [270, 130],
    [350, 60],
    [90, 275],
  ];

  return (
    <div className={`relative overflow-hidden rounded-sm bg-card ${className}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="size-full" role="img" aria-label="Mapa da rota (ilustração)">
        <path d="M0 200 Q100 150 200 190 T400 120" fill="none" stroke="#f0dfbd" strokeOpacity="0.08" strokeWidth="28" />
        <path d="M0 80 Q140 40 260 90 T400 40" fill="none" stroke="#f0dfbd" strokeOpacity="0.06" strokeWidth="18" />
        <path d="M40 250 C80 230 100 225 120 215 S170 170 190 150 S240 140 270 130 S330 90 350 60" fill="none" stroke="#ea6a2e" strokeWidth="4" strokeLinecap="round" />
        <path d="M350 60 C300 150 200 250 90 275" fill="none" stroke="#ea6a2e" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
        {points.map(([x, y], index) => (
          <g key={index}>
            <circle cx={x} cy={y} r="13" fill="#0c0b0a" stroke="#f0dfbd" strokeWidth="1.5" />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#f0dfbd">
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
      <span className="label absolute right-2 bottom-2 bg-background/80 px-2 py-1 text-muted-foreground">
        mapa interativo
      </span>
    </div>
  );
}

export function Answer() {
  return (
    <div className="rounded-sm bg-card p-5">
      <p className="label text-muted-foreground">Você vai?</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button>Vou</Button>
        <Button variant="outline">Não vou</Button>
      </div>
      <p className="mt-4 text-sm text-cream-dim">
        Vão {ride.going} · Não vão {ride.notGoing} · Sem resposta {ride.waiting}
      </p>
    </div>
  );
}

export function Weather() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-4">
        {weather.map((item) => (
          <li key={item.where}>
            <p className="label text-muted-foreground">{item.where}</p>
            <p className="mt-1 text-2xl font-semibold">{item.temp}</p>
            <p className="text-sm text-cream-dim">{item.rain}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-cream-dim">Previsão atualizada hoje. Plano B: {ride.planB}</p>
    </div>
  );
}

export function Outside() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button variant="outline">Abrir no Google Maps</Button>
      <Button variant="ghost">Adicionar à agenda</Button>
    </div>
  );
}

export function Gallery() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map((tile) => (
          <div key={tile} className="aspect-square rounded-sm bg-card" />
        ))}
      </div>
      <p className="mt-3 text-sm text-cream-dim">
        Aparece depois do passeio. Quem foi envia até 10 fotos; um administrador aprova antes de publicar.
      </p>
      <Button variant="outline" className="mt-3">
        Enviar fotos
      </Button>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="label mb-4 text-foreground">{children}</h2>;
}

export function Heading() {
  return (
    <>
      <h1 className="display text-[clamp(2rem,6vw,2.75rem)]">{ride.title}</h1>
      <p className="mt-3 text-xl font-semibold text-highlight">
        {ride.day} · encontro {ride.meetAt} · saída {ride.leaveAt}
      </p>
    </>
  );
}

