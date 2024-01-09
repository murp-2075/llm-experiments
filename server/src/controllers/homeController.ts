import { Request, Response } from 'express';
import chat from '../utils/openai';
import userModel from '../models/users';
import { Thread, Message } from '../models/openai';

class HomeController {


    static async login(req: Request, res: Response) {
        res.render('login', { user: req.session.user, isLoggedIn: !!req.session.user });
    }

    static async test(req: Request, res: Response) {
        res.json({ "test": "test" })
    }


    static async loginSubmit(req: Request, res: Response) {
        const { email, password } = req.body;
        const userObject = await userModel.findByEmail(email);
        if (!userObject) {
            return res.redirect('/login');
        }
        const failedAttempts = await userObject.getFailedLoginAttempts();
        const maxSleepTime = parseInt(Bun.env.MAX_FAILED_LOGIN_SLEEP || '600000');
        // await setTimeout(Math.min(maxSleepTime, Math.pow(2, failedAttempts) * 1000));
        await new Promise(resolve => setTimeout(resolve, Math.min(maxSleepTime, Math.pow(2, failedAttempts) * 1000)));
        const isValid = await userObject.validatePassword(password);
        await userObject.insertLoginAttempt(req.ip, isValid);
        if (isValid) {
            req.session.user = userObject;
            res.redirect('/app.html');
        } else {
            res.redirect('/login.html');
        }
    }

    static async logout(req: Request, res: Response) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    }

    static async initializehomepage(req: Request, res: Response) {
        if (req.session.user) {
            res.send(`
            <a class="btn btn-primary" id="loginLogoutButton" hx-swap-oob="true" hx-get="/api/logout">Log Out</a>
            <li class="nav-item" id="appLink" hx-swap-oob="true">
                <a class="nav-link" href="/app.html">App</a>
            </li>`)
        } else {
            res.send('<a class="btn btn-primary" hx-swap-oob="true" id="loginLogoutButton" href="/login.html">Log In</a>')
        }
    }


}
export default HomeController;
