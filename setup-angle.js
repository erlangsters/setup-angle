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

async function run() {
  try {
    let branch = core.getInput('branch');
    if (!branch) {
      branch = "chromium/5615";
    }
    console.log(`Setting up ANGLE from branch: ${branch}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
