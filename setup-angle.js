//
// Copyright (c) 2025, Byteplug LLC.
//
// This source file is part of a project made by the Erlangsters community and
// is released under the MIT license. Please refer to the LICENSE.md file that
// can be found at the root of the project repository.
//
// Written by Jonathan De Wachter <jonathan.dewachter@byteplug.io>
//
const core = require('@actions/core');
const path = require('path');
const os = require('os');
const tc = require('@actions/tool-cache');

// XXX: Perhaps allow customizing where the pre-built ANGLE binaries are
//      downloaded from.
// XXX: Fix the branch/commit temporary workaround.

// By default, this is where it downloads the pre-built ANGLE binaries.
const S3_ENDPOINT_URL = 'https://hel1.your-objectstorage.com';
const S3_BUCKET_NAME = 'erlangsters';
const S3_PATH_PREFIX = 'angle';

// The available ANGLE branches, in descending order (important!).
const ANGLE_BRANCHES = [
  "fdff117"
];

// The default ANGLE branch.
function defaultBranch() {
  return ANGLE_BRANCHES[0];
}

// Detect the runner's OS and architecture so we can download the correct
// pre-built ANGLE binaries.
function getRunnerOS() {
  const platform = os.platform();
  if (platform === 'win32') {
    return 'windows';
  } else if (platform === 'darwin') {
    return 'macos';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}
function getRunnerArchitecture() {
  const arch = os.arch();
  if (arch === 'x64') {
    return 'amd64';
  } else if (arch === 'arm64') {
    return 'arm64';
  } else {
    throw new Error(`Unsupported architecture: ${arch}`);
  }
}
function detectPlatform() {
  const platform = {
    os: getRunnerOS(),
    arch: getRunnerArchitecture()
  };
  return platform;
}

// Compute the platform name, which is used in the tarball name of the
// pre-built binaries.
function computePlatformName(platform) {
  return `${platform.os}-${platform.arch}`;
}

// The name of the tarball (which contains the pre-built binaries) follows a
// specific format: angle-<branch>-<os>-<arch>.tar.gz (the '/' in the branch
// name is replaced by '-').
function computeTarballName(version, platform) {
  const platformName = computePlatformName(platform);
  // Replace '/' with '-' in the branch name to create a valid tarball name.
  const tarballName = `angle-${version}-${platformName}.tar.gz`;
  return tarballName;
}
function computeFolderName(version, platform) {
  const platformName = computePlatformName(platform);
  // Replace '/' with '-' in the branch name to create a valid tarball name.
  const tarballName = `angle-${version}-${platformName}`;
  return tarballName;
}


// The tarballs folder is where the pre-built binaries are stored in the S3
// bucket (for a given Erlang version).
function computeTarballsFolder(version) {
  const tarballFolder = `${S3_ENDPOINT_URL}/${S3_BUCKET_NAME}/${S3_PATH_PREFIX}/${version}`;
  return tarballFolder;
}


async function run() {
  try {
    // Read the ANGLE branch from the input. Use the default ANGLE branch if
    // not specified.
    let angleBranch = core.getInput('angle-branch');
    if (!angleBranch) {
      console.log('No ANGLE branch specified, using the default branch.');
      angleBranch = defaultBranch();
    }
    else {
      console.log(`ANGLE branch ${angleBranch} is requested.`);

      // Abort if branch is not available.
      if (!ANGLE_BRANCHES.includes(angleBranch)) {
        throw new Error(`ANGLE branch ${angleBranch} is not available. Available branches: ${ANGLE_BRANCHES.join(', ')}.`);
      }
    }
    console.log(`ANGLE branch to install is ${angleBranch}.`);

    // Detect the platform where the action is running (so we understand what
    // pre-built binaries to install).
    const platform = detectPlatform();
    console.log(`Detected platform is ${JSON.stringify(platform)}.`);

    // Based on the platform, compute the location of the tarball to download
    // from the S3 bucket.
    const platformName = computePlatformName(platform);

    const tarballName = computeTarballName(angleBranch, platform);
    const tarballsFolder = computeTarballsFolder(angleBranch, platform);
    const tarballLocation = `${tarballsFolder}/${tarballName}`;
    console.log(`Computed pre-built binary URL is ${tarballLocation}`);

    // We download (if not already cached) the pre-built binaries and extract
    // into the installation directory.
    let toolPath = tc.find('angle', angleBranch, platform.arch);
    if (!toolPath) {
      // Try to download the tarball from the S3 bucket.
      let tarballDownloadPath;
      try {
        tarballDownloadPath = await tc.downloadTool(tarballLocation);
        console.log(`Downloaded ANGLE to ${tarballDownloadPath}.`);
      } catch (error) {
        throw new Error(`Failed to download ANGLE tarball: ${error.message}`);
      }

      const tempExtractedPath = await tc.extractTar(tarballDownloadPath);
      console.log(`Extracted ANGLE to ${tempExtractedPath}.`);

      // Cache the final installation directory
      toolPath = await tc.cacheDir(tempExtractedPath, 'angle', angleBranch, platform.arch);
      console.log(`Cached ANGLE to ${toolPath}`);

    } else {
      console.log(`ANGLE found in cache at ${toolPath}`);
    }
    const angleLocation = path.join(toolPath, computeFolderName(angleBranch, platform));

    // Indicate the ANGLE branch that has actually been installed.
    core.setOutput('angle-branch', angleBranch);

    // Indicate the location of the ANGLE installation.
    core.setOutput('angle-location', angleLocation);

    console.log(`ANGLE successfully installed at ${angleLocation}.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
