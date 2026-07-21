const { execFile } = require('node:child_process');
const { mkdir, mkdtemp, rm, symlink } = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { MakerBase } = require('@electron-forge/maker-base');

const execFileAsync = promisify(execFile);

class NativeDmgMaker extends MakerBase {
  name = 'dmg';

  defaultPlatforms = ['darwin'];

  requiredExternalBinaries = ['ditto', 'hdiutil'];

  isSupportedOnCurrentPlatform() {
    return process.platform === 'darwin';
  }

  async make({ appName, dir, makeDir }) {
    const artifactName = this.config.name || appName;
    const sourceApp = path.join(dir, `${appName}.app`);
    const outputPath = path.join(makeDir, `${artifactName}.dmg`);

    await mkdir(makeDir, { recursive: true });
    await rm(outputPath, { force: true });

    const temporaryDirectory = await mkdtemp(path.join(makeDir, '.dmg-staging-'));
    const volumeDirectory = path.join(temporaryDirectory, artifactName);

    try {
      await mkdir(volumeDirectory);
      await execFileAsync('/usr/bin/ditto', [sourceApp, path.join(volumeDirectory, `${appName}.app`)]);
      await symlink('/Applications', path.join(volumeDirectory, 'Applications'));
      await execFileAsync('/usr/bin/hdiutil', [
        'create',
        '-volname', artifactName,
        '-srcfolder', volumeDirectory,
        '-ov',
        '-format', this.config.format || 'UDZO',
        outputPath,
      ]);
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }

    return [outputPath];
  }
}

module.exports = NativeDmgMaker;
