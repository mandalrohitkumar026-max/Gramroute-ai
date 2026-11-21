"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
const { combine, timestamp, printf, colorize, json } = winston_1.default.format;
const customFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}]: ${message}${metaString}`;
});
exports.logger = winston_1.default.createLogger({
    level: env_1.config.LOG_LEVEL,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), env_1.config.NODE_ENV === 'production' ? json() : combine(colorize(), customFormat)),
    transports: [
        new winston_1.default.transports.Console()
    ]
});
// Stream for HTTP morgan / request logging if needed
exports.logStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    }
};
