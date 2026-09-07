import { readFile, writeFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';
import { parseEnv } from 'node:util';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const modules = JSON.parse(await readFile(path.join(ROOT, 'config/modules.json'), 'utf8'));
export const features = JSON.parse(await readFile(path.join(ROOT, 'config/merged-features.json'), 'utf8'));

export function selectModules(id) {
  if (id === 'all') return modules;
  const module = modules.find(m => m.id === id);
  if (!module) throw new Error(`Unknown module. Choose: ${modules.map(m => m.id).join(', ')} or all.`);
  return [module];
}
export async function readEnv(file) {
  try { return parseEnv(await readFile(file, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
}
export function validateConfig(module, env) {
  const issues = [];
  if (!env.DATABASE_URL) issues.push('DATABASE_URL is missing');
  else {
    try {
      const url = new URL(env.DATABASE_URL);
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length < 2) throw new Error();
    } catch { issues.push('DATABASE_URL must identify a PostgreSQL database'); }
  }
  if (!env[module.secret] || env[module.secret].length < 32) issues.push(`${module.secret} needs at least 32 characters`);
  return issues;
}
export function commandFor(service) {
  if (service.kind === 'node') return [process.execPath, [service.entry]];
  const binaries = { next: 'next/dist/bin/next', vite: 'vite/bin/vite.js', cra: 'react-scripts/bin/react-scripts.js' };
  const args = service.kind === 'next' ? ['dev', ...(service.bundler === 'webpack' ? ['--webpack'] : []), '--hostname', '127.0.0.1', '--port', String(service.port)]
    : service.kind === 'vite' ? ['--host', '127.0.0.1', '--port', String(service.port), '--strictPort'] : ['start'];
  return [process.execPath, [path.join('node_modules', binaries[service.kind]), ...args]];
}
export function serviceEnv(module, service, local, shared = {}) {
  const url = `http://localhost:${module.port}`;
  const api = module.services.find(s => s.kind === 'node')?.port ?? module.port;
  return {
    ...process.env, ...shared, ...local, NODE_ENV: 'development',
    PORT: String(service.port), BACKEND_PORT: String(api), HOST: '127.0.0.1',
    CLIENT_URL: url, CORS_ORIGINS: url, NEXTAUTH_URL: url, BASE_URL: url,
    REACT_APP_API_URL: `http://localhost:${api}/api`, VITE_API_TARGET: `http://localhost:${api}`,
    VITE_PORT: String(module.port), BROWSER: 'none',
  };
}
export async function portListening(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    let finished = false;
    const done = value => { if (!finished) { finished = true; socket.destroy(); resolve(value); } };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.setTimeout(350, () => done(false));
  });
}
export async function assertPortFree(port) {
  // macOS can bind IPv4 and IPv6 separately; probe both explicitly.
  if (await portListening(port)) throw new Error(`Port ${port} is occupied. Stop its owning app before starting this module.`);
  for (const host of ['127.0.0.1', '::1']) await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => {
      if (host === '::1' && ['EADDRNOTAVAIL', 'EAFNOSUPPORT'].includes(error.code)) resolve();
      else reject(new Error(`Port ${port} is occupied or unavailable. Stop its owning app before starting this module.`));
    });
    server.listen(port, host, () => server.close(resolve));
  });
}
export async function readiness(module) {
  const base = path.join(ROOT, 'apps', module.id);
  const env = await readEnv(path.join(base, '.env'));
  const issues = validateConfig(module, env);
  for (const service of module.services) {
    const dir = path.join(base, service.dir);
    try { await access(path.join(dir, 'node_modules')); }
    catch { issues.push(`Install dependencies in ${service.dir === '.' ? module.id : `${module.id}/${service.dir}`}`); }
  }
  const listening = await portListening(module.port);
  return { id: module.id, listening, configured: !issues.length, issues, aiConfigured: Boolean(env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY) };
}
async function initialize(selected) {
  for (const module of selected) {
    const file = path.join(ROOT, 'apps', module.id, '.env');
    const text = `# A separate database is required. See this module's README.\nDATABASE_URL=\n${module.secret}=${randomBytes(48).toString('hex')}\n# AI is optional; set your provider key and model when needed.\nOPENROUTER_API_KEY=\nOPENROUTER_MODEL=\n`;
    try { await writeFile(file, text, { flag: 'wx', mode: 0o600 }); console.log(`Created apps/${module.id}/.env`); }
    catch (e) { if (e.code !== 'EEXIST') throw e; console.log(`Preserved apps/${module.id}/.env`); }
  }
}
async function install(selected) {
  for (const module of selected) for (const service of module.services) {
    const cwd = path.join(ROOT, 'apps', module.id, service.dir);
    const command = existsSync(path.join(cwd, 'package-lock.json')) ? 'ci' : 'install';
    console.log(`Installing ${module.id}/${service.dir}`);
    await new Promise((resolve, reject) => {
      const child = spawn('npm', [command, '--no-audit', '--no-fund'], { cwd, stdio: 'inherit' });
      child.once('error', reject);
      child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Install failed for ${module.id}/${service.dir}`)));
    });
  }
}
async function startModules(selected) {
  const configs = new Map();
  const databaseIds = new Set();
  // Complete preflight before starting any process or touching any database.
  for (const module of selected) {
    const status = await readiness(module);
    if (!status.configured) throw new Error(`${module.id}: ${status.issues.join('; ')}. Run ./start.sh init ${module.id}, edit its .env, and install dependencies.`);
    const local = await readEnv(path.join(ROOT, 'apps', module.id, '.env'));
    const db = new URL(local.DATABASE_URL);
    const identity = `${db.hostname}:${db.port || 5432}${db.pathname}`;
    if (databaseIds.has(identity)) throw new Error('Each module needs a separate database. Refusing to start conflicting schemas.');
    databaseIds.add(identity); configs.set(module.id, local);
    for (const service of module.services) await assertPortFree(service.port);
  }
  const children = new Set();
  let stopping = false;
  const stop = code => {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    // Only groups spawned by this invocation are signalled. Never clear arbitrary ports.
    for (const child of children) { try { process.kill(-child.pid, 'SIGTERM'); } catch {} }
    const timer = setTimeout(() => {
      for (const child of children) { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
    }, 4000);
    timer.unref();
  };
  process.once('SIGINT', () => stop(0));
  process.once('SIGTERM', () => stop(0));
  for (const module of selected) {
    console.log(`${module.name}: http://localhost:${module.port}${module.entry}`);
    for (const service of module.services) {
      const [command, args] = commandFor(service);
      const child = spawn(command, args, { cwd: path.join(ROOT, 'apps', module.id, service.dir), env: serviceEnv(module, service, configs.get(module.id)), stdio: 'inherit', detached: true });
      children.add(child);
      child.once('error', () => { console.error(`Unable to start ${module.id}/${service.dir}`); children.delete(child); stop(1); });
      child.once('exit', code => { children.delete(child); if (!stopping) { console.error(`${module.id}/${service.dir} exited (${code}). Stopping this workspace invocation.`); stop(code || 1); } });
    }
  }
}
export async function main(args = process.argv.slice(2)) {
  const [command = 'doctor', id = 'all'] = args;
  if (command === 'doctor') {
    const results = await Promise.all(selectModules(id).map(readiness));
    for (const result of results) console.log(`${result.id}: ${result.listening ? 'port listening; ' : ''}${result.issues.length ? result.issues.join('; ') : 'configuration present (database/login not verified)'}`);
    return;
  }
  const selected = selectModules(id);
  if (command === 'init') return initialize(selected);
  if (command === 'install') return install(selected);
  if (command === 'start') return startModules(selected);
  throw new Error('Usage: ./start.sh [doctor|init|install|start] [module-id|all]');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
