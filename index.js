const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function run() {
  try {
    const username = core.getInput('username');
    const password = core.getInput('password');
    const packageFile = core.getInput('packageFile');
    const uuid = core.getInput('uuid');
    
    if (!fs.existsSync(packageFile)) {
      core.setFailed(`Package file does not exist: ${packageFile}`);
      return;
    }

    const url = 'https://your-server.example.com/api/upload';

    const form = new FormData();
    form.append('file', fs.createReadStream(packageFile));
    form.append('username', username);
    form.append('password', password);

    // @todo: implement me

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
