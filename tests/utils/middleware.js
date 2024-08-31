"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserMiddleware = void 0;
const setUserMiddleware = (req, res, next) => {
    const userHeader = req.headers['user'];
    if (userHeader) {
        req.user = JSON.parse(userHeader);
    }
    next();
};
exports.setUserMiddleware = setUserMiddleware;
