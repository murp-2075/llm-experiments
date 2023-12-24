import express from 'express';

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any }; // or the type of your user object
    }
}

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Your authentication logic here
    // Load user, verify token, etc.
    if (req.session.user == null) {
        return next("User is not logged in");
    }
    next();
};

const isLoggedIn = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session.user == null) {
        return res.redirect('/login');
    }
    next();
}

export { authMiddleware, isLoggedIn };
export default authMiddleware;
