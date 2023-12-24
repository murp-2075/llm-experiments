import { Request, Response } from 'express';
// @ts-nocheck
// eslint-disable-next-line
// import userView from '../views/user.ejs';
// import ejs from 'ejs';

class UserController {
    static async getAllUsers(req: Request, res: Response) {
        //show the userView
        // let template = ejs.compile(userView);
        // const str = template({ users: ['user1', 'user2', 'user3'] });
        // res.send(str);
        res.render('user', { users: ['user1', 'user2', 'user3'] })
        // Logic to retrieve all users
    }

    static getUserById(req: Request, res: Response) {
        // Logic to retrieve a user by ID
    }

    // ... other methods for create, update, delete
}
export default UserController;
