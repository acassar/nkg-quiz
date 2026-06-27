// Charge .env.test dans process.env AVANT que quoi que ce soit ne démarre.
// PrismaClient lit DATABASE_URL à sa création — il faut donc que la bonne
// URL (base de test) soit déjà en place ici.
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.test") });
