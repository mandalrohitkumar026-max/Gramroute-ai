"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const appError_1 = require("../utils/appError");
const validate = (schema) => {
    return async (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message
                }));
                next(new appError_1.AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
