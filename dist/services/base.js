"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../helpers/errors");
const axios_1 = require("../helpers/axios");
const fs = require("fs");
const path = require("path");
const jsObfuscator = require("javascript-obfuscator");
const cp = require("child_process");
class ServiceBase extends errors_1.default {
    constructor(opts) {
        super();
        this.clientOptions = {};
        const customClientOptions = {
            headers: {
                'accept': 'application/json',
            },
            maxRedirects: 0,
        };
        if (opts) {
            if (opts.cookie) {
                customClientOptions.headers['cookie'] = opts.cookie;
            }
        }
        this.clientOptions = customClientOptions;
        this.v1 = axios_1.default('v1', this.clientOptions);
        this.v2 = axios_1.default('v2', this.clientOptions);
        this.fs = fs;
        this.path = path;
        this.jsObfuscator = jsObfuscator;
        this.cp = cp;
    }
}
exports.default = ServiceBase;
