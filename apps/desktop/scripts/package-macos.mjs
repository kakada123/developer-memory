import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const desktopDirectory = join(scriptDirectory, '..');
const repositoryDirectory = join(desktopDirectory, '..', '..');
const apiDirectory = join(repositoryDirectory, 'apps', 'api');
const electronApplication = join(repositoryDirectory, 'node_modules', 'electron', 'dist', 'Electron.app');
const releaseDirectory = join(desktopDirectory, 'release');
const applicationName = 'Developer Memory';
const applicationPath = join(releaseDirectory, `${applicationName}.app`);
const applicationResources = join(applicationPath, 'Contents', 'Resources');
const packagedApplication = join(applicationResources, 'app');
const applicationNodeModules = join(packagedApplication, 'node_modules');

const desktopPackage = JSON.parse(await readFile(join(desktopDirectory, 'package.json'), 'utf8'));
const apiPackage = JSON.parse(await readFile(join(apiDirectory, 'package.json'), 'utf8'));
const sensitiveExtensions = ['.key', '.p12', '.pem', '.pfx'];
const sensitiveNames = new Set(['auth.json', 'credentials.json', 'service-account.json', 'token.json']);
const copiedPackages = new Set();

function quoteShellArgument(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function shouldCopy(source) {
  if (source.split(sep).includes('.bin')) return false;

  const filename = basename(source).toLowerCase();
  if (sensitiveNames.has(filename) || filename.startsWith('.env')) return false;
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

async function copyPackage(packageName, sourceDirectory, destinationDirectory) {
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

    if (dependencySource.startsWith(`${sourceDirectory}${sep}`)) {
      await copyPackage(
        dependencyName,
        dependencySource,
        join(destinationDirectory, relative(sourceDirectory, dependencySource)),
      );
    } else {
      await copyPackage(dependencyName, dependencySource, join(applicationNodeModules, dependencyName));
    }
  }
}

await mkdir(releaseDirectory, { recursive: true });
await rm(applicationPath, { recursive: true, force: true });
execFileSync('/usr/bin/ditto', [electronApplication, applicationPath]);

const executableDirectory = join(applicationPath, 'Contents', 'MacOS');
await rename(join(executableDirectory, 'Electron'), join(executableDirectory, applicationName));
await rm(join(applicationResources, 'default_app.asar'), { force: true });
await cp(join(desktopDirectory, 'build', 'icon.icns'), join(applicationResources, 'DeveloperMemory.icns'));

const infoPlist = join(applicationPath, 'Contents', 'Info.plist');
const plistValues = [
  ['CFBundleDisplayName', applicationName],
  ['CFBundleExecutable', applicationName],
  ['CFBundleIconFile', 'DeveloperMemory.icns'],
  ['CFBundleIdentifier', 'com.developermemory.desktop'],
  ['CFBundleName', applicationName],
  ['CFBundleShortVersionString', desktopPackage.version],
  ['CFBundleVersion', desktopPackage.version],
];

for (const [key, value] of plistValues) {
  execFileSync('/usr/bin/plutil', ['-replace', key, '-string', value, infoPlist]);
}

for (const key of [
  'ElectronAsarIntegrity',
  'NSBluetoothAlwaysUsageDescription',
  'NSBluetoothPeripheralUsageDescription',
  'NSCameraUsageDescription',
  'NSMicrophoneUsageDescription',
]) {
  try {
    execFileSync('/usr/bin/plutil', ['-remove', key, infoPlist], { stdio: 'ignore' });
  } catch {
    // Optional Electron template keys may not exist in future releases.
  }
}

execFileSync('/usr/bin/plutil', [
  '-replace',
  'NSAppTransportSecurity',
  '-json',
  '{"NSAllowsLocalNetworking":true}',
  infoPlist,
]);

await mkdir(packagedApplication, { recursive: true });
await cp(join(desktopDirectory, 'dist'), join(packagedApplication, 'dist'), { recursive: true });
await cp(join(desktopDirectory, 'dist-electron'), join(packagedApplication, 'dist-electron'), { recursive: true });
await cp(join(apiDirectory, 'dist'), join(packagedApplication, 'api', 'dist'), { recursive: true });
await writeFile(join(packagedApplication, 'api', 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2));
await mkdir(applicationNodeModules, { recursive: true });

for (const dependencyName of Object.keys(apiPackage.dependencies ?? {})) {
  const dependencySource = await findInstalledPackage(dependencyName, apiDirectory);
  if (!dependencySource) throw new Error(`Required API dependency is not installed: ${dependencyName}`);
  await copyPackage(dependencyName, dependencySource, join(applicationNodeModules, dependencyName));
}

await writeFile(join(packagedApplication, 'package.json'), JSON.stringify({
  name: desktopPackage.name,
  productName: applicationName,
  version: desktopPackage.version,
  private: true,
  type: 'module',
  main: 'dist-electron/main.js',
}, null, 2));

const quotedApplicationPath = quoteShellArgument(applicationPath);

console.log(`Created unsigned local build at ${applicationPath}`);
console.log('\nIf macOS blocks this trusted local build, run:');
console.log(`  xattr -dr com.apple.quarantine ${quotedApplicationPath}`);
console.log(`  open ${quotedApplicationPath}`);
console.log('\nDo not disable Gatekeeper globally. Public releases require Developer ID signing and notarization.');
