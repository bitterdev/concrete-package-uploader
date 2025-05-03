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
    
    if (!fs.existsSync(packageFile)) {
      core.setFailed(`Package file does not exist: ${packageFile}`);
      return;
    }

    const url = 'https://your-server.example.com/api/upload'; // <- Ziel-URL anpassen

    const form = new FormData();
    form.append('file', fs.createReadStream(packageFile));
    form.append('username', username);
    form.append('password', password);

    return;
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    if (response.status === 200) {
      core.info('Package uploaded successfully');
    } else {
      core.setFailed(`Upload failed with status: ${response.status}`);
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
