const path = require('node:path');
const desktopPackage = require('./package.json');
const NativeDmgMaker = require('./scripts/forge-maker-dmg.cjs');

const applicationName = 'Developer Memory';
const applicationBundleId = 'com.developermemory.desktop';
const runtimeDirectory = path.resolve(__dirname, '.forge-runtime');
const signingIdentity = process.env.MACOS_SIGN_IDENTITY;
const rootConfigFilePattern = /^\/(?:forge\.config\.cjs|index\.html|tsconfig(?:\.[^.]+)?\.json|vite\.config\.ts)$/;

const localAdHocSign = {
  identity: '-',
  identityValidation: false,
  continueOnError: false,
  preAutoEntitlements: false,
  preEmbedProvisioningProfile: false,
  optionsForFile: () => ({
    hardenedRuntime: false,
    timestamp: 'none',
  }),
};

module.exports = {
  outDir: 'release',
  packagerConfig: {
    name: applicationName,
    executableName: applicationName,
    appBundleId: applicationBundleId,
    helperBundleId: `${applicationBundleId}.helper`,
    appCategoryType: 'public.app-category.developer-tools',
    icon: path.resolve(__dirname, 'build', 'icon.icns'),
    asar: true,
    prune: false,
    overwrite: true,
    tmpdir: path.resolve(__dirname, '..', '..', '.forge-tmp'),
    electronZipDir: path.join(runtimeDirectory, 'electron'),
    extraResource: [
      path.join(runtimeDirectory, 'api'),
      path.join(runtimeDirectory, 'node_modules'),
    ],
    ignore: [
      /[/\\]\.forge-cache(?:[/\\]|$)/,
      /[/\\]\.forge-runtime(?:[/\\]|$)/,
      /[/\\]build(?:[/\\]|$)/,
      /[/\\]electron(?:[/\\]|$)/,
      /[/\\]node_modules(?:[/\\]|$)/,
      /[/\\]release(?:[/\\]|$)/,
      /[/\\]scripts(?:[/\\]|$)/,
      /[/\\]src(?:[/\\]|$)/,
      rootConfigFilePattern,
    ],
    extendInfo: {
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
    osxSign: signingIdentity
      ? { identity: signingIdentity, continueOnError: false }
      : localAdHocSign,
  },
  makers: [
    new NativeDmgMaker(
      (arch) => ({
        name: `Developer-Memory-${desktopPackage.version}-${arch}`,
        format: 'UDZO',
      }),
      ['darwin'],
    ),
  ],
};
