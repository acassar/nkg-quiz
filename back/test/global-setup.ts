// S'exécute UNE fois avant toute la suite de tests.
// Garantit que la base de test existe et que son schéma est à jour,
// pour que `npm test` soit autonome (aucune étape manuelle préalable).
import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";

export default function globalSetup() {
  const envPath = resolve(__dirname, "..", ".env.test");
  config({ path: envPath });

  // `prisma db push` crée la base si absente et synchronise le schéma.
  // On passe DATABASE_URL via l'env du process enfant.
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env },
  });
}
