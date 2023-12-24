import express from 'express';
const router = express.Router();
const { authMiddleware, isLoggedIn } = require('../middleware/authMiddleware');


// Import the user controller
import HomeController from '../controllers/homeController';

// GET request to retrieve all users
router.get('/', HomeController.home);
router.get('/login', HomeController.login);
router.post('/login', HomeController.loginSubmit);
router.get('/logout', HomeController.logout);
router.get('/messaging', isLoggedIn, HomeController.messaging);
router.post('/submitmessage', isLoggedIn, HomeController.handleMessage);
router.get('/test', HomeController.test);


export default router;
