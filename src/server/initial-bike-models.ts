// The list the platform started with, as the migration that created the table wrote it.
// The tests reset the database to it; a test keeps the two in step.
export const INITIAL_BIKE_MODELS = [
  { name: "Scrambler 400 X", engineSize: 400 },
  { name: "Scrambler 400 XC", engineSize: 400 },
  { name: "Scrambler 900", engineSize: 900 },
  { name: "Street Scrambler", engineSize: 900 },
  { name: "Scrambler 1200 X", engineSize: 1200 },
  { name: "Scrambler 1200 XC", engineSize: 1200 },
  { name: "Scrambler 1200 XE", engineSize: 1200 },
  { name: "Scrambler 865", engineSize: 865 },
];
