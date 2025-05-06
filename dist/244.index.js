exports.id = 244;
exports.ids = [244];
exports.modules = {

/***/ 6387:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.req = exports.json = exports.toBuffer = void 0;
const http = __importStar(__webpack_require__(8611));
const https = __importStar(__webpack_require__(5692));
async function toBuffer(stream) {
    let length = 0;
    const chunks = [];
    for await (const chunk of stream) {
        length += chunk.length;
        chunks.push(chunk);
    }
    return Buffer.concat(chunks, length);
}
exports.toBuffer = toBuffer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function json(stream) {
    const buf = await toBuffer(stream);
    const str = buf.toString('utf8');
    try {
        return JSON.parse(str);
    }
    catch (_err) {
        const err = _err;
        err.message += ` (input: ${str})`;
        throw err;
    }
}
exports.json = json;
function req(url, opts = {}) {
    const href = typeof url === 'string' ? url : url.href;
    const req = (href.startsWith('https:') ? https : http).request(url, opts);
    const promise = new Promise((resolve, reject) => {
        req
            .once('response', resolve)
            .once('error', reject)
            .end();
    });
    req.then = promise.then.bind(promise);
    return req;
}
exports.req = req;
//# sourceMappingURL=helpers.js.map

/***/ }),

/***/ 9874:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Agent = void 0;
const net = __importStar(__webpack_require__(9278));
const http = __importStar(__webpack_require__(8611));
const https_1 = __webpack_require__(5692);
__exportStar(__webpack_require__(6387), exports);
const INTERNAL = Symbol('AgentBaseInternalState');
class Agent extends http.Agent {
    constructor(opts) {
        super(opts);
        this[INTERNAL] = {};
    }
    /**
     * Determine whether this is an `http` or `https` request.
     */
    isSecureEndpoint(options) {
        if (options) {
            // First check the `secureEndpoint` property explicitly, since this
            // means that a parent `Agent` is "passing through" to this instance.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof options.secureEndpoint === 'boolean') {
                return options.secureEndpoint;
            }
            // If no explicit `secure` endpoint, check if `protocol` property is
            // set. This will usually be the case since using a full string URL
            // or `URL` instance should be the most common usage.
            if (typeof options.protocol === 'string') {
                return options.protocol === 'https:';
            }
        }
        // Finally, if no `protocol` property was set, then fall back to
        // checking the stack trace of the current call stack, and try to
        // detect the "https" module.
        const { stack } = new Error();
        if (typeof stack !== 'string')
            return false;
        return stack
            .split('\n')
            .some((l) => l.indexOf('(https.js:') !== -1 ||
            l.indexOf('node:https:') !== -1);
    }
    // In order to support async signatures in `connect()` and Node's native
    // connection pooling in `http.Agent`, the array of sockets for each origin
    // has to be updated synchronously. This is so the length of the array is
    // accurate when `addRequest()` is next called. We achieve this by creating a
    // fake socket and adding it to `sockets[origin]` and incrementing
    // `totalSocketCount`.
    incrementSockets(name) {
        // If `maxSockets` and `maxTotalSockets` are both Infinity then there is no
        // need to create a fake socket because Node.js native connection pooling
        // will never be invoked.
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
            return null;
        }
        // All instances of `sockets` are expected TypeScript errors. The
        // alternative is to add it as a private property of this class but that
        // will break TypeScript subclassing.
        if (!this.sockets[name]) {
            // @ts-expect-error `sockets` is readonly in `@types/node`
            this.sockets[name] = [];
        }
        const fakeSocket = new net.Socket({ writable: false });
        this.sockets[name].push(fakeSocket);
        // @ts-expect-error `totalSocketCount` isn't defined in `@types/node`
        this.totalSocketCount++;
        return fakeSocket;
    }
    decrementSockets(name, socket) {
        if (!this.sockets[name] || socket === null) {
            return;
        }
        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
            sockets.splice(index, 1);
            // @ts-expect-error  `totalSocketCount` isn't defined in `@types/node`
            this.totalSocketCount--;
            if (sockets.length === 0) {
                // @ts-expect-error `sockets` is readonly in `@types/node`
                delete this.sockets[name];
            }
        }
    }
    // In order to properly update the socket pool, we need to call `getName()` on
    // the core `https.Agent` if it is a secureEndpoint.
    getName(options) {
        const secureEndpoint = typeof options.secureEndpoint === 'boolean'
            ? options.secureEndpoint
            : this.isSecureEndpoint(options);
        if (secureEndpoint) {
            // @ts-expect-error `getName()` isn't defined in `@types/node`
            return https_1.Agent.prototype.getName.call(this, options);
        }
        // @ts-expect-error `getName()` isn't defined in `@types/node`
        return super.getName(options);
    }
    createSocket(req, options, cb) {
        const connectOpts = {
            ...options,
            secureEndpoint: this.isSecureEndpoint(options),
        };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);
        Promise.resolve()
            .then(() => this.connect(req, connectOpts))
            .then((socket) => {
            this.decrementSockets(name, fakeSocket);
            if (socket instanceof http.Agent) {
                try {
                    // @ts-expect-error `addRequest()` isn't defined in `@types/node`
                    return socket.addRequest(req, connectOpts);
                }
                catch (err) {
                    return cb(err);
                }
            }
            this[INTERNAL].currentSocket = socket;
            // @ts-expect-error `createSocket()` isn't defined in `@types/node`
            super.createSocket(req, options, cb);
        }, (err) => {
            this.decrementSockets(name, fakeSocket);
            cb(err);
        });
    }
    createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = undefined;
        if (!socket) {
            throw new Error('No socket was returned in the `connect()` function');
        }
        return socket;
    }
    get defaultPort() {
        return (this[INTERNAL].defaultPort ??
            (this.protocol === 'https:' ? 443 : 80));
    }
    set defaultPort(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].defaultPort = v;
        }
    }
    get protocol() {
        return (this[INTERNAL].protocol ??
            (this.isSecureEndpoint() ? 'https:' : 'http:'));
    }
    set protocol(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].protocol = v;
        }
    }
}
exports.Agent = Agent;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9384:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createCookieAgent = createCookieAgent;
var _nodeUrl = _interopRequireDefault(__webpack_require__(3136));
var _create_cookie_header_value = __webpack_require__(331);
var _save_cookies_from_header = __webpack_require__(7734);
var _validate_cookie_options = __webpack_require__(1094);
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const kCookieOptions = Symbol('cookieOptions');
const kReimplicitHeader = Symbol('reimplicitHeader');
const kRecreateFirstChunk = Symbol('recreateFirstChunk');
const kOverrideRequest = Symbol('overrideRequest');
function createCookieAgent(BaseAgentClass) {
  // @ts-expect-error -- BaseAgentClass is type definition.
  class CookieAgent extends BaseAgentClass {
    constructor(...params) {
      const {
        cookies: cookieOptions
      } = params.find(opt => {
        return opt != null && typeof opt === 'object' && 'cookies' in opt;
      }) ?? {};
      super(...params);
      if (cookieOptions) {
        (0, _validate_cookie_options.validateCookieOptions)(cookieOptions);
      }
      this[kCookieOptions] = cookieOptions;
    }
    [kReimplicitHeader](req) {
      const _headerSent = req._headerSent;
      req._header = null;
      req._implicitHeader();
      req._headerSent = _headerSent;
    }
    [kRecreateFirstChunk](req) {
      const firstChunk = req.outputData[0];
      if (req._header == null || firstChunk == null) {
        return;
      }
      const prevData = firstChunk.data;
      const prevHeaderLength = prevData.indexOf('\r\n\r\n');
      if (prevHeaderLength === -1) {
        firstChunk.data = req._header;
      } else {
        firstChunk.data = `${req._header}${prevData.slice(prevHeaderLength + 4)}`;
      }
      const diffSize = firstChunk.data.length - prevData.length;
      req.outputSize += diffSize;
      req._onPendingData(diffSize);
    }
    [kOverrideRequest](req, requestUrl, cookieOptions) {
      const _implicitHeader = req._implicitHeader.bind(req);
      req._implicitHeader = () => {
        try {
          const cookieHeader = (0, _create_cookie_header_value.createCookieHeaderValue)({
            cookieOptions,
            passedValues: [req.getHeader('Cookie')].flat(),
            requestUrl
          });
          if (cookieHeader) {
            req.setHeader('Cookie', cookieHeader);
          }
        } catch (err) {
          req.destroy(err);
          return;
        }
        _implicitHeader();
      };
      const emit = req.emit.bind(req);
      req.emit = (event, ...args) => {
        if (event === 'response') {
          try {
            const res = args[0];
            (0, _save_cookies_from_header.saveCookiesFromHeader)({
              cookieOptions,
              cookies: res.headers['set-cookie'],
              requestUrl
            });
          } catch (err) {
            req.destroy(err);
            return false;
          }
        }
        return emit(event, ...args);
      };
    }
    addRequest(req, options) {
      const cookieOptions = this[kCookieOptions];
      if (cookieOptions) {
        try {
          const requestUrl = _nodeUrl.default.format({
            host: req.host,
            pathname: req.path,
            protocol: req.protocol
          });
          this[kOverrideRequest](req, requestUrl, cookieOptions);
          if (req._header != null) {
            this[kReimplicitHeader](req);
          }
          if (req._headerSent) {
            this[kRecreateFirstChunk](req);
          }
        } catch (err) {
          req.destroy(err);
          return;
        }
      }
      super.addRequest(req, options);
    }
  }
  return CookieAgent;
}

/***/ }),

/***/ 540:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.HttpCookieAgent = void 0;
var _nodeHttp = _interopRequireDefault(__webpack_require__(7067));
var _create_cookie_agent = __webpack_require__(9384);
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const HttpCookieAgent = exports.HttpCookieAgent = (0, _create_cookie_agent.createCookieAgent)(_nodeHttp.default.Agent);

/***/ }),

/***/ 4563:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.HttpsCookieAgent = void 0;
var _nodeHttps = _interopRequireDefault(__webpack_require__(2327));
var _create_cookie_agent = __webpack_require__(9384);
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const HttpsCookieAgent = exports.HttpsCookieAgent = (0, _create_cookie_agent.createCookieAgent)(_nodeHttps.default.Agent);

/***/ }),

/***/ 3153:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
Object.defineProperty(exports, "HttpCookieAgent", ({
  enumerable: true,
  get: function () {
    return _http_cookie_agent.HttpCookieAgent;
  }
}));
Object.defineProperty(exports, "HttpsCookieAgent", ({
  enumerable: true,
  get: function () {
    return _https_cookie_agent.HttpsCookieAgent;
  }
}));
__webpack_unused_export__ = ({
  enumerable: true,
  get: function () {
    return _mixed_cookie_agent.MixedCookieAgent;
  }
});
__webpack_unused_export__ = ({
  enumerable: true,
  get: function () {
    return _create_cookie_agent.createCookieAgent;
  }
});
var _create_cookie_agent = __webpack_require__(9384);
var _http_cookie_agent = __webpack_require__(540);
var _https_cookie_agent = __webpack_require__(4563);
var _mixed_cookie_agent = __webpack_require__(2677);

/***/ }),

/***/ 2677:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.MixedCookieAgent = void 0;
var _agentBase = __webpack_require__(9874);
var _http_cookie_agent = __webpack_require__(540);
var _https_cookie_agent = __webpack_require__(4563);
class MixedCookieAgent extends _agentBase.Agent {
  constructor(options) {
    super();
    this._httpAgent = new _http_cookie_agent.HttpCookieAgent(options);
    this._httpsAgent = new _https_cookie_agent.HttpsCookieAgent(options);
  }
  connect(_req, options) {
    return options.secureEndpoint ? this._httpsAgent : this._httpAgent;
  }
}
exports.MixedCookieAgent = MixedCookieAgent;

/***/ }),

/***/ 331:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createCookieHeaderValue = createCookieHeaderValue;
var _toughCookie = __webpack_require__(3008);
function createCookieHeaderValue({
  cookieOptions,
  passedValues,
  requestUrl
}) {
  const {
    jar
  } = cookieOptions;
  const cookies = jar.getCookiesSync(requestUrl);
  const cookiesMap = new Map(cookies.map(cookie => [cookie.key, cookie]));
  for (const passedValue of passedValues) {
    if (typeof passedValue !== 'string') {
      continue;
    }
    for (const str of passedValue.split(';')) {
      const cookie = _toughCookie.Cookie.parse(str.trim());
      if (cookie != null) {
        cookiesMap.set(cookie.key, cookie);
      }
    }
  }
  const cookieHeaderValue = Array.from(cookiesMap.values()).map(cookie => cookie.cookieString()).join(';\x20');
  return cookieHeaderValue;
}

/***/ }),

/***/ 7734:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.saveCookiesFromHeader = saveCookiesFromHeader;
function saveCookiesFromHeader({
  cookieOptions,
  cookies,
  requestUrl
}) {
  const {
    jar
  } = cookieOptions;
  for (const cookie of [cookies].flat()) {
    if (cookie == null) {
      continue;
    }
    jar.setCookieSync(cookie, requestUrl, {
      ignoreError: true
    });
  }
}

/***/ }),

/***/ 1094:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.validateCookieOptions = validateCookieOptions;
function validateCookieOptions(opts) {
  if (!('jar' in opts)) {
    throw new TypeError('invalid cookies.jar');
  }
  if (!opts.jar.store.synchronous) {
    throw new TypeError('an asynchronous cookie store is not supported.');
  }
}

/***/ }),

/***/ 8972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(3153);


/***/ }),

/***/ 3244:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   wrapper: () => (/* binding */ wrapper)
/* harmony export */ });
/* harmony import */ var http_cookie_agent_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8972);

const AGENT_CREATED_BY_AXIOS_COOKIEJAR_SUPPORT = Symbol('AGENT_CREATED_BY_AXIOS_COOKIEJAR_SUPPORT');
function requestInterceptor(config) {
    if (!config.jar) {
        return config;
    }
    // @ts-expect-error -- Legacy config allows to assign boolean as jar.
    if (config.jar === true) {
        throw new Error('config.jar does not accept boolean since axios-cookiejar-support@2.0.0.');
    }
    if ((config.httpAgent != null &&
        config.httpAgent[AGENT_CREATED_BY_AXIOS_COOKIEJAR_SUPPORT] !== true) ||
        (config.httpsAgent != null &&
            config.httpsAgent[AGENT_CREATED_BY_AXIOS_COOKIEJAR_SUPPORT] !== true)) {
        throw new Error('axios-cookiejar-support does not support for use with other http(s).Agent.');
    }
    config.httpAgent = new http_cookie_agent_http__WEBPACK_IMPORTED_MODULE_0__.HttpCookieAgent({ cookies: { jar: config.jar } });
    Object.defineProperty(config.httpAgent, AGENT_CREATED_BY_AXIOS_COOKIEJAR_SUPPORT, {
        configurable: false,
        enumerable: false,
        value: true,
        writable: false,
    });
    config.httpsAgent = new http_cookie_agent_http__WEBPACK_IMPORTED_MODULE_0__.HttpsCookieAgent({ cookies: { jar: config.jar } });
    Object.defineProperty(config.httpsAgent, AGENT_CREATED_BY_AXIOS_COOKIEJAR_SUPPORT, {
        configurable: false,
        enumerable: false,
        value: true,
        writable: false,
    });
    return config;
}
function wrapper(axios) {
    const isWrapped = axios.interceptors.request.handlers.find(({ fulfilled }) => fulfilled === requestInterceptor);
    if (isWrapped) {
        return axios;
    }
    axios.interceptors.request.use(requestInterceptor);
    if ('create' in axios) {
        const create = axios.create.bind(axios);
        axios.create = (...args) => {
            const instance = create.apply(axios, args);
            instance.interceptors.request.use(requestInterceptor);
            return instance;
        };
    }
    return axios;
}


/***/ })

};
;