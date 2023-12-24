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
        console.log("req.body: ", req.body)
        const { email, password } = req.body;
        const userObject = userModel.findByEmail(email);
        if (!userObject) {
            return res.redirect('/login');
        }
        const isValid = await userObject.validatePassword(password);
        if (isValid) {
            req.session.user = userObject;
            console.log("redirected")
            res.redirect('/messaging');
        } else {
            console.log("stuck on logiin")
            res.redirect('/login');
        }
    }

    static async messaging(req: Request, res: Response) {
        const threads = await Thread.getThreadsByUserId(req.session.user?.id);
        if (threads.length === 0 && req.session.user) {
            const thread = await Thread.addThread(req.session.user?.id, 'New Thread');
            threads.push(thread);
            req.session.user.selectedThreadId = thread.id;
        }
        threads.forEach((thread: Thread) => {
            const date = new Date(thread.createdAt);
            thread.createdAt = date.toLocaleDateString();
        })
        if (req.session.user && !req.session.user.selectedThreadId) {
            req.session.user.selectedThreadId = threads[0].id;
        }
        const threadId = threads[0].id;
        const messages = await Message.getMessagesByThreadId(threadId);
        res.render('messaging', {
            user: req.session.user,
            isLoggedIn: !!req.session.user,
            threads,
            selectedThreadId: req.session.user?.selectedThreadId,
            messages
        });
    }


    static async logout(req: Request, res: Response) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    }


    static async handleMessage(req: Request, res: Response) {
        //time this request
        console.time("handleMessage")

        console.log("I got ", req.body, req.session.user)
        const { message } = req.body;
        const results = await chat([{ role: 'user', content: message }]);
        res.render('leftMessage', { user: req.session.user, isLoggedIn: !!req.session.user });
        console.timeEnd("handleMessage")
    }
}
export default HomeController;
