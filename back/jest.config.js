/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  // Les tests d'intégration vivent dans test/ avec le suffixe .spec.ts
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  // setup-env.ts s'exécute avant chaque fichier de test, pour charger .env.test
  setupFiles: ["<rootDir>/test/setup-env.ts"],
  // global-setup.ts s'exécute UNE fois avant toute la suite : crée/sync la DB de test
  globalSetup: "<rootDir>/test/global-setup.ts",
  // Les tests touchent une vraie DB : on évite le parallélisme qui mêlerait les données
  maxWorkers: 1,
  // Laisse le temps aux opérations DB (push, requêtes)
  testTimeout: 30000,
  moduleNameMapper: {
    // Les packages partagés : on lit la SOURCE .ts (ts-jest compile),
    // ce qui évite le conflit ESM (dist) vs CommonJS (jest).
    "^@nkg-quiz/shared-socket-types$":
      "<rootDir>/../packages/shared-socket-types/src/index.ts",
    "^@nkg-quiz/shared-types$": "<rootDir>/../packages/shared-types/src/index.ts",
    // nanoid v5 est ESM-only → on le remplace par un stub CJS déterministe.
    "^nanoid$": "<rootDir>/test/mocks/nanoid.ts",
    // Les imports internes des packages écrivent "./events.js" (style ESM) ;
    // on retire le .js pour que jest résolve le fichier .ts correspondant.
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
