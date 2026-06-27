// Stub CommonJS de nanoid (la v5 réelle est ESM-only et casse sous Jest/CJS).
// Un compteur garantit l'unicité des codes de session au sein d'un run de test.
let counter = 0;

export function nanoid(size = 6): string {
  counter += 1;
  return `TST${counter}`.padEnd(size, "0").slice(0, size);
}
