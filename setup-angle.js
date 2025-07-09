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
