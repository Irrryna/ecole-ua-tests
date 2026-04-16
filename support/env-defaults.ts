/**
 * Variables d'environnement par défaut pour le mode standalone BDD.
 * Chargé EN PREMIER par cucumber.json avant tout autre module.
 *
 * Crée un fichier .env.bdd à la racine du projet (il est gitignore)
 * pour définir les credentials locaux. Voir .env.bdd.example.
 */

import fs from 'node:fs';
import path from 'node:path';

// Charge .env.bdd s'il existe (credentials locaux, non commités)
const envBddPath = path.resolve(process.cwd(), '.env.bdd');
if (fs.existsSync(envBddPath)) {
  const content = fs.readFileSync(envBddPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    (process.env as Record<string, string>)[key] ??= val;
  }
}

// Valeurs par défaut (peuvent être surchargées par .env.bdd ou variables système)
process.env['SKIP_ADMIN_LOCAL'] ??= '1';
process.env['BASE_URL']         ??= 'http://127.0.0.1:4200';
process.env['API_BASE_URL']     ??= 'http://127.0.0.1:3000';
