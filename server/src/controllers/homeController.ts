import { Request, Response } from 'express';
import chat from '../utils/openai';
import userModel from '../models/users';
import { Thread, Message } from '../models/openai';

class HomeController {


    static async home(req: Request, res: Response) {
        console.log("rendering", req.session.user)
        res.render('home', { user: req.session.user, isLoggedIn: !!req.session.user });
    }


    static async login(req: Request, res: Response) {
        res.render('login', { user: req.session.user, isLoggedIn: !!req.session.user });
    }

    static async test(req: Request, res: Response) {
        //return some test json
        console.log(req.session.user)
        res.json({ "test": "test" })
    }


    static async loginSubmit(req: Request, res: Response) {
        const { email, password } = req.body;
        const userObject = userModel.findByEmail(email);
        if (!userObject) {
            return res.redirect('/login');
        }
        const failedAttempts = await userObject.getFailedLoginAttempts();
        // Sleep for a exponetial amount of time based on the number of failed attempts up to 1 hour 
        const maxTime = 60 * 60 * 1000;
        await new Promise(resolve => setTimeout(resolve, Math.min(maxTime, Math.pow(2, failedAttempts) * 1000)));
        const isValid = await userObject.validatePassword(password);
        await userObject.insertLoginAttempt(req.ip, isValid);
        if (isValid) {
            req.session.user = userObject;
            res.redirect('/messaging');
        } else {
            res.redirect('/login');
        }
    }

    static async logout(req: Request, res: Response) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    }


}
export default HomeController;
