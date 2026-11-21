"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().transform((val) => parseInt(val, 10)).default('5000'),
    MONGODB_URI: zod_1.z.string().default('mongodb://localhost:27017/gramroute_ai'),
    JWT_SECRET: zod_1.z.string().min(16).default('development_super_secret_jwt_key_min_32_chars_long'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    COOKIE_SECRET: zod_1.z.string().min(16).default('development_cookie_secret_key_32_chars'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    AI_ENGINE_URL: zod_1.z.string().url().default('http://localhost:8000'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info')
});
const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        // eslint-disable-next-line no-console
        console.error('❌ Invalid environment configuration:', JSON.stringify(parsed.error.format(), null, 2));
        throw new Error('Environment variable validation failed');
    }
    return parsed.data;
};
exports.config = parseEnv();
