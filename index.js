const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const AdmZip = require('adm-zip');
const cheerio = require('cheerio');
const tough = require('tough-cookie');

async function run() {
    try {
        const axiosCookieJarSupportModule = await import('axios-cookiejar-support');
        const axiosCookieJarSupport = axiosCookieJarSupportModule.wrapper;

        if (typeof axiosCookieJarSupport !== 'function') {
            throw new Error(`axiosCookieJarSupport is not a function. Got type: ${typeof axiosCookieJarSupport}`);
        }

        axiosCookieJarSupport(axios);
        const cookieJar = new tough.CookieJar();

        const axiosWithCookies = axios.create({
            jar: cookieJar,
            withCredentials: true,
            maxRedirects: 0,
        });

        let username = core.getInput('username');
        let password = core.getInput('password');
        let packageFile = core.getInput('packageFile');
        let productGuid = core.getInput('uuid');
        let versionNumber = core.getInput('versionNumber');
        let changelog = core.getInput('changelog');

        if (!fs.existsSync(packageFile)) {
            core.setFailed(`Package file does not exist: ${packageFile}`);
            return;
        }

        try {
            let zip = new AdmZip(packageFile);
            let tempDir = path.join(__dirname, 'temp_extract');
            zip.extractAllTo(tempDir, true);

            let subDir = '';
            let tempDirContents = fs.readdirSync(tempDir, {withFileTypes: true});
            for (let item of tempDirContents) {
                if (item.isDirectory()) {
                    subDir = item.name;
                    break;
                }
            }

            if (!subDir) {
                core.setFailed('No subdirectory found in tempDir');
                return;
            }

            let baseDir = path.join(tempDir, subDir);

            if (versionNumber.length === 0) {
                let controllerPath = path.join(baseDir, 'controller.php');
                versionNumber = '0.0.1';
                if (fs.existsSync(controllerPath)) {
                    let controllerContent = fs.readFileSync(controllerPath, 'utf8');
                    let versionMatch = controllerContent.match(/\$pkgVersion\s*=\s*['"]([^'"]+)['"]/);
                    if (versionMatch) {
                        versionNumber = versionMatch[1];
                    } else {
                        core.setFailed('No version found in controller.php');
                        return;
                    }
                } else {
                    core.setFailed('controller.php not found at ' + controllerPath);
                    return;
                }
            }

            if (changelog.length === 0) {
                changelog = 'Update';
                let changelogPath = path.join(baseDir, 'CHANGELOG');
                if (fs.existsSync(changelogPath)) {
                    let changelogContent = fs.readFileSync(changelogPath, 'utf8');
                    let regex = new RegExp(`Version ${versionNumber}\\s*\\n=+\\s*\\n([\\s\\S]*?)(?=\\nVersion|\\n==|$)`);
                    let versionSectionMatch = changelogContent.match(regex);
                    if (versionSectionMatch) {
                        changelog = versionSectionMatch[1].trim();
                    }
                } else {
                    core.setFailed('CHANGELOG not found at ' + changelogPath);
                    return;
                }
            }

            fs.rmSync(tempDir, {recursive: true, force: true});

            let getLoginFormResponse = await axiosWithCookies.get(
                'https://market.concretecms.com/ccm/system/authentication/oauth2/external_concrete/attempt_auth',
                {
                    headers: {
                        'Accept': 'text/html'
                    },
                    maxRedirects: 5,
                    validateStatus: status => status >= 200 && status < 400
                }
            );

            let $doc = cheerio.load(getLoginFormResponse.data);
            let loginActionUrl = $doc('#ccm_login_form').attr('action');
            let loginToken = $doc('input[name=ccm_token]').attr('value');

            if (!loginActionUrl) {
                core.setFailed('Could not find form action URL');
                return;
            }

            if (!loginToken) {
                core.setFailed('Could not find form login token');
                return;
            }

            await axiosWithCookies.post(
                loginActionUrl,
                new URLSearchParams({
                    uName: username,
                    uPassword: password,
                    ccm_token: loginToken
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    },
                    maxRedirects: 5
                }
            );

            let productDetailsUrl = `https://market.concretecms.com/account/products/details/${productGuid}`;
            let detailsResponse = await axiosWithCookies.get(productDetailsUrl);

            let $detailsDoc = cheerio.load(detailsResponse.data);
            let productDetails = $detailsDoc('product-details');
            let uploadRequestEndpoint = productDetails.attr('upload-request-endpoint');
            let packageFiles = JSON.parse(productDetails.attr(':package-files'));
            let newFileToken = productDetails.attr('new-file-token');
            let deleteFileToken = productDetails.attr('delete-file-token');
            let uploadUrl = `${uploadRequestEndpoint}?ccm_token=${newFileToken}`;

            const unapprovedPackageFile = packageFiles.find(entry => entry.approvalStatus === 0);

            if (unapprovedPackageFile) {
                await axiosWithCookies.delete(`https://market.concretecms.com/depot/products/files/${unapprovedPackageFile.id}`, {
                    ccm_token: deleteFileToken
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            }

            let uploadResponse = await axiosWithCookies.get(uploadUrl);

            let {add_file_token, upload_id, upload_uri} = uploadResponse.data;

            await axiosWithCookies.put(upload_uri, fs.readFileSync(packageFile), {
                headers: {
                    'Content-Type': 'application/zip'
                }
            });

            let form = new FormData();

            form.append('uploadId', upload_id);
            form.append('ccm_token', add_file_token);
            form.append('productId', productGuid);
            form.append('version', versionNumber);
            form.append('description', changelog);

            let finalResponse = await axiosWithCookies.post('https://market.concretecms.com/index.php/depot/products/files', form);

            console.log(finalResponse);

        } catch (error) {
            throw error;
        }

    } catch (error) {
        core.setFailed(`Action failed: ${error.message}`);
    }
}

run();
