/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 974:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 461:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ }),

/***/ 936:
/***/ ((module) => {

module.exports = eval("require")("form-data");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(974);
const fs = __nccwpck_require__(896);
const path = __nccwpck_require__(928);
const axios = __nccwpck_require__(461);
const FormData = __nccwpck_require__(936);

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

module.exports = __webpack_exports__;
/******/ })()
;