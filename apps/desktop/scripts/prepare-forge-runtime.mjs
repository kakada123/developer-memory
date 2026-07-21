import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const desktopDirectory = join(scriptDirectory, '..');
const repositoryDirectory = join(desktopDirectory, '..', '..');
const apiDirectory = join(repositoryDirectory, 'apps', 'api');
const electronDirectory = join(repositoryDirectory, 'node_modules', 'electron');
const runtimeDirectory = join(desktopDirectory, '.forge-runtime');
const runtimeApiDirectory = join(runtimeDirectory, 'api');
const runtimeElectronDirectory = join(runtimeDirectory, 'electron');
const runtimeNodeModules = join(runtimeDirectory, 'node_modules');
const sensitiveExtensions = ['.key', '.p12', '.pem', '.pfx'];
const sensitiveNames = new Set([
  'auth.json',
  'credentials.json',
  'firebase-adminsdk.json',
  'google-credentials.json',
  'service-account.json',
  'serviceaccount.json',
  'token.json',
]);

function shouldCopy(source) {
  if (source.split(sep).includes('.bin')) return false;

  const filename = basename(source).toLowerCase();
  if (
    sensitiveNames.has(filename)
    || filename.startsWith('.env')
    || filename.startsWith('firebase-adminsdk-')
    || filename.startsWith('service-account-')
  ) return false;

  return !sensitiveExtensions.some((extension) => filename.endsWith(extension));
}

async function findInstalledPackage(packageName, startDirectory) {
  let currentDirectory = startDirectory;

  while (true) {
    const candidate = join(currentDirectory, 'node_modules', packageName);
    try {
      await readFile(join(candidate, 'package.json'), 'utf8');
      return candidate;
    } catch {
      const parentDirectory = dirname(currentDirectory);
      if (parentDirectory === currentDirectory) return null;
      currentDirectory = parentDirectory;
    }
  }
}

async function copyPackage(sourceDirectory, destinationDirectory, copiedPackages) {
  const copyKey = `${sourceDirectory}\0${destinationDirectory}`;
  if (copiedPackages.has(copyKey)) return;
  copiedPackages.add(copyKey);

  await cp(sourceDirectory, destinationDirectory, { recursive: true, filter: shouldCopy });

  const packageManifest = JSON.parse(await readFile(join(sourceDirectory, 'package.json'), 'utf8'));
  const dependencies = {
    ...packageManifest.dependencies,
    ...packageManifest.optionalDependencies,
  };

  for (const dependencyName of Object.keys(dependencies)) {
    const dependencySource = await findInstalledPackage(dependencyName, sourceDirectory);
    if (!dependencySource) continue;

    const nestedDependency = dependencySource.startsWith(`${sourceDirectory}${sep}`);
    const dependencyDestination = nestedDependency
      ? join(destinationDirectory, relative(sourceDirectory, dependencySource))
      : join(runtimeNodeModules, dependencyName);
    await copyPackage(dependencySource, dependencyDestination, copiedPackages);
  }
}

async function prepareElectronArchive(platform, arch) {
  if (platform !== 'darwin' || arch !== process.arch) {
    throw new Error(`The local Electron runtime can only package darwin/${process.arch}; received ${platform}/${arch}`);
  }

  const electronPackage = JSON.parse(await readFile(join(electronDirectory, 'package.json'), 'utf8'));
  const archivePath = join(
    runtimeElectronDirectory,
    `electron-v${electronPackage.version}-${platform}-${arch}.zip`,
  );

  await mkdir(runtimeElectronDirectory, { recursive: true });
  execFileSync('/usr/bin/zip', ['-qry', archivePath, '.'], {
    cwd: join(electronDirectory, 'dist'),
  });
}

export async function prepareForgeRuntime(platform = process.platform, arch = process.arch) {
  const apiPackage = JSON.parse(await readFile(join(apiDirectory, 'package.json'), 'utf8'));
  const copiedPackages = new Set();

  await rm(runtimeDirectory, { recursive: true, force: true });
  await mkdir(runtimeApiDirectory, { recursive: true });
  await mkdir(runtimeNodeModules, { recursive: true });
  await cp(join(apiDirectory, 'dist'), join(runtimeApiDirectory, 'dist'), { recursive: true });
  await writeFile(
    join(runtimeApiDirectory, 'package.json'),
    JSON.stringify({ type: 'commonjs' }, null, 2),
  );

  for (const dependencyName of Object.keys(apiPackage.dependencies ?? {})) {
    const dependencySource = await findInstalledPackage(dependencyName, apiDirectory);
    if (!dependencySource) throw new Error(`Required API dependency is not installed: ${dependencyName}`);
    await copyPackage(
      dependencySource,
      join(runtimeNodeModules, dependencyName),
      copiedPackages,
    );
  }

  await prepareElectronArchive(platform, arch);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await prepareForgeRuntime();
}
