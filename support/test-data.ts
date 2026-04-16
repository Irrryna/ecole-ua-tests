import { request, type APIRequestContext } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface LoginAccount {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface DashboardSeed {
  admin: LoginAccount;
  teacher: LoginAccount;
  parent: LoginAccount;
  pendingParent: LoginAccount;
  classRoom: { id: string; name: string; ageGroup: string };
  subject: { id: string; nameFr: string; nameUk: string };
  child: { id: string; firstName: string; lastName: string };
  timeSlot: { id: string; label: string };
  homework: { description: string };
  announcement: { title: string };
  document: { name: string };
  resource: { title: string };
  privateContent: { title: string };
  suffix: string;
}

/**
 * Path resolution works in two modes:
 *  1. As a git submodule at frontend/tests/browser/ inside ecole-ua-lyon
 *     → __dirname = …/frontend/tests/browser/support
 *     → frontendRoot = …/frontend  ✓
 *  2. Standalone (both servers already running, no admin:local seeding needed)
 *     → set BACKEND_ROOT env variable to the backend directory path
 */
const frontendRoot = process.env.FRONTEND_ROOT
  ? path.resolve(process.env.FRONTEND_ROOT)
  : path.resolve(__dirname, '..', '..', '..');

const backendRoot = process.env.BACKEND_ROOT
  ? path.resolve(process.env.BACKEND_ROOT)
  : path.resolve(frontendRoot, '..', 'backend');

const envLocalPath = path.join(backendRoot, '.env.local');
const apiBaseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000';

let cachedSeedPromise: Promise<DashboardSeed> | null = null;

export async function ensureDashboardSeed(): Promise<DashboardSeed> {
  if (!cachedSeedPromise) {
    cachedSeedPromise = createDashboardSeed();
  }

  return cachedSeedPromise;
}

async function createDashboardSeed(): Promise<DashboardSeed> {
  if (!process.env.SKIP_ADMIN_LOCAL) {
    ensureLocalAdminAccount();
  }

  const localEnv = loadSeedEnv();
  const admin: LoginAccount = {
    email: requiredEnv(localEnv, 'ADMIN_LOCAL_EMAIL'),
    password: requiredEnv(localEnv, 'ADMIN_LOCAL_PASSWORD'),
    firstName: localEnv.ADMIN_LOCAL_FIRST_NAME || 'Admin',
    lastName: localEnv.ADMIN_LOCAL_LAST_NAME || 'Ecole',
  };

  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const teacher: LoginAccount = {
    email: `pw.teacher.${suffix}@example.test`,
    password: 'Playwright123!',
    firstName: 'Playwright',
    lastName: `Teacher${suffix}`,
  };
  const parent: LoginAccount = {
    email: `pw.parent.${suffix}@example.test`,
    password: 'Playwright123!',
    firstName: 'Playwright',
    lastName: `Parent${suffix}`,
  };
  const pendingParent: LoginAccount = {
    email: `pw.pending.${suffix}@example.test`,
    password: 'Playwright123!',
    firstName: 'Pending',
    lastName: `Parent${suffix}`,
  };

  const api = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  });

  try {
    const adminSession = await login(api, admin.email, admin.password);

    const createdTeacher = await post(api, '/users', {
      ...teacher,
      role: 'TEACHER',
    });
    teacher.id = createdTeacher.id;
    const createdParent = await post(api, '/users', {
      ...parent,
      role: 'PARENT',
    });
    parent.id = createdParent.id;
    const createdPendingParent = await post(api, '/users', {
      ...pendingParent,
      role: 'PARENT',
    });
    pendingParent.id = createdPendingParent.id;

    await patch(api, `/users/${teacher.id}`, { status: 'VALIDE' }, adminSession.access_token);
    await patch(api, `/users/${parent.id}`, { status: 'VALIDE' }, adminSession.access_token);

    const classRoom = await post(
      api,
      '/users/classes',
      {
        name: `PW Classe ${suffix}`,
        ageGroup: '8-9 ans',
      },
      adminSession.access_token,
    );

    const subject = await post(
      api,
      '/users/subjects',
      {
        nameFr: `PW Matiere ${suffix}`,
        nameUk: `PW Predmet ${suffix}`,
        color: '#2563EB',
      },
      adminSession.access_token,
    );

    await patch(
      api,
      `/users/${teacher.id}/assign-subject`,
      { subjectId: subject.id },
      adminSession.access_token,
    );
    await patch(
      api,
      `/users/${teacher.id}/assign-class`,
      { classId: classRoom.id },
      adminSession.access_token,
    );

    const existingTimeSlots = await get(api, '/schedule/time-slots', adminSession.access_token);
    const timeSlot =
      existingTimeSlots[0] ??
      (await post(
        api,
        '/schedule/time-slots',
        {
          startTime: '08:00',
          endTime: '09:00',
          sortOrder: 1,
        },
        adminSession.access_token,
      ));

    await post(
      api,
      '/users/admin/schedule-entry',
      {
        classId: classRoom.id,
        timeSlotId: timeSlot.id,
        entryType: 'COURSE',
        subjectId: subject.id,
        teacherId: teacher.id,
      },
      adminSession.access_token,
    );

    const parentSession = await login(api, parent.email, parent.password);
    const child = await post(
      api,
      '/users/parent/me/children',
      {
        firstName: 'PlayChild',
        lastName: `Kid${suffix}`,
        birthDate: '2018-05-12',
        birthPlace: 'Kyiv',
        schoolName: 'Ecole de test locale',
        frenchSchoolClass: 'CE1',
        address: '12 rue des tests',
        phone: '0102030405',
      },
      parentSession.access_token,
    );

    await patch(
      api,
      `/users/children/${child.id}/class`,
      { classId: classRoom.id },
      adminSession.access_token,
    );

    const teacherSession = await login(api, teacher.email, teacher.password);
    const homeworkDescription = `PW devoir ${suffix}`;
    const announcementTitle = `PW annonce ${suffix}`;
    const documentName = `pw-document-${suffix}.pdf`;
    const resourceTitle = `PW ressource ${suffix}`;
    const privateContentTitle = `PW info interne ${suffix}`;

    await post(
      api,
      `/users/classes/${classRoom.id}/homework`,
      {
        subject: subject.nameFr,
        description: homeworkDescription,
        dueDate: getNextSaturdayIsoDate(),
        status: 'PUBLIE',
        intro: 'Preparation Playwright',
      },
      teacherSession.access_token,
    );

    await post(
      api,
      '/users/announcements/broadcast',
      {
        targetScope: 'CLASS',
        classId: classRoom.id,
        title: announcementTitle,
        content: `Contenu annonce ${suffix}`,
        expiresAt: getNextSaturdayIsoDate(),
      },
      teacherSession.access_token,
    );

    await post(
      api,
      `/users/classes/${classRoom.id}/documents`,
      {
        name: documentName,
        url: `https://example.com/${documentName}`,
        format: 'pdf',
        size: 1024,
      },
      teacherSession.access_token,
    );

    await post(
      api,
      '/users/educational-files',
      {
        title: resourceTitle,
        description: 'Ressource de test navigateur',
        url: `https://example.com/pw-resource-${suffix}`,
        isFile: false,
        format: 'link',
        size: 0,
        classId: classRoom.id,
      },
      teacherSession.access_token,
    );

    await post(
      api,
      '/contents',
      {
        type: 'ANNONCE',
        lang: 'fr',
        title: privateContentTitle,
        summary: 'Annonce interne seedee pour les tests navigateur',
        body: 'Contenu seed pour le dashboard parent.',
        visibility: 'PRIVE',
        status: 'PUBLIE',
      },
      teacherSession.access_token,
    );

    return {
      admin,
      teacher,
      parent,
      pendingParent,
      classRoom: {
        id: classRoom.id,
        name: classRoom.name,
        ageGroup: classRoom.ageGroup,
      },
      subject: {
        id: subject.id,
        nameFr: subject.nameFr,
        nameUk: subject.nameUk,
      },
      child: {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
      },
      timeSlot: {
        id: timeSlot.id,
        label: timeSlot.label,
      },
      homework: {
        description: homeworkDescription,
      },
      announcement: {
        title: announcementTitle,
      },
      document: {
        name: documentName,
      },
      resource: {
        title: resourceTitle,
      },
      privateContent: {
        title: privateContentTitle,
      },
      suffix,
    };
  } finally {
    await api.dispose();
  }
}

/**
 * Supprime toutes les données créées par ensureDashboardSeed().
 * À appeler dans le hook AfterAll de Cucumber.
 * Chaque suppression est isolée dans un try/catch : si une entité a déjà été
 * supprimée par un scénario, on continue sans erreur.
 */
export async function cleanupDashboardSeed(): Promise<void> {
  if (!cachedSeedPromise) return;

  let seed: DashboardSeed;
  try {
    seed = await cachedSeedPromise;
  } catch {
    // Le seed a échoué, rien à nettoyer
    cachedSeedPromise = null;
    return;
  }

  cachedSeedPromise = null;

  const api = await request.newContext({
    baseURL: apiBaseUrl,
    extraHTTPHeaders: { Accept: 'application/json' },
  });

  try {
    const { access_token } = await login(api, seed.admin.email, seed.admin.password);

    // Enfant
    await tryDelete(api, `/users/children/${seed.child.id}`, access_token);

    // Classe (cascade : devoirs, documents, entrées planning)
    await tryDelete(api, `/users/classes/${seed.classRoom.id}`, access_token);

    // Matière
    await tryDelete(api, `/users/subjects/${seed.subject.id}`, access_token);

    // Utilisateurs de test (cascade : annonces, ressources, contenus)
    if (seed.teacher.id)       await tryDelete(api, `/users/${seed.teacher.id}`, access_token);
    if (seed.parent.id)        await tryDelete(api, `/users/${seed.parent.id}`, access_token);
    if (seed.pendingParent.id) await tryDelete(api, `/users/${seed.pendingParent.id}`, access_token);

    console.log('[cleanup] Données de test supprimées ✓');
  } catch (err) {
    console.warn('[cleanup] Erreur lors du nettoyage :', err);
  } finally {
    await api.dispose();
  }
}

async function tryDelete(api: APIRequestContext, url: string, token: string): Promise<void> {
  try {
    const response = await api.delete(url, { headers: buildHeaders(token) });
    if (!response.ok() && response.status() !== 404) {
      console.warn(`[cleanup] DELETE ${url} → ${response.status()}`);
    }
  } catch {
    console.warn(`[cleanup] DELETE ${url} inaccessible, ignoré`);
  }
}

function ensureLocalAdminAccount() {
  execSync('npm run admin:local', {
    cwd: backendRoot,
    stdio: 'inherit',
    shell: true,
  });
}

function loadSeedEnv(): Record<string, string> {
  const fileEnv = fs.existsSync(envLocalPath) ? readEnvFile(envLocalPath) : {};
  const runtimeEnv = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  return {
    ...fileEnv,
    ...runtimeEnv,
  };
}

function readEnvFile(filePath: string): Record<string, string> {
  const contents = fs.readFileSync(filePath, 'utf8');
  const pairs = contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex < 0) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, '');
      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return Object.fromEntries(pairs);
}

function requiredEnv(env: Record<string, string>, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Variable locale manquante: ${key}`);
  }

  return value;
}

async function login(api: APIRequestContext, email: string, password: string) {
  return post(api, '/users/login', { email, password });
}

async function get(api: APIRequestContext, url: string, token?: string) {
  const response = await api.get(url, {
    headers: buildHeaders(token),
  });

  return parseResponse(response, `GET ${url}`);
}

async function post(api: APIRequestContext, url: string, data: unknown, token?: string) {
  const response = await api.post(url, {
    data,
    headers: buildHeaders(token),
  });

  return parseResponse(response, `POST ${url}`);
}

async function patch(api: APIRequestContext, url: string, data: unknown, token?: string) {
  const response = await api.patch(url, {
    data,
    headers: buildHeaders(token),
  });

  return parseResponse(response, `PATCH ${url}`);
}

function buildHeaders(token?: string) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

async function parseResponse(response: Awaited<ReturnType<APIRequestContext['get']>>, action: string) {
  const responseText = await response.text();

  if (!response.ok()) {
    throw new Error(`${action} failed with ${response.status()}: ${responseText}`);
  }

  return responseText ? JSON.parse(responseText) : null;
}

function getNextSaturdayIsoDate(): string {
  const now = new Date();
  const day = now.getDay();
  const target = new Date(now);

  if (day === 6 && now.getHours() >= 16) {
    target.setDate(now.getDate() + 7);
  } else {
    const diff = (6 - day + 7) % 7;
    target.setDate(now.getDate() + diff);
  }

  target.setHours(0, 0, 0, 0);
  return target.toISOString();
}
