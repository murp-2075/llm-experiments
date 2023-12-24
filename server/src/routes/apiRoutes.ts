import express from 'express';
const router = express.Router();
const { authMiddleware, isLoggedIn } = require('../middleware/authMiddleware');


// Import the api controller
import APIController from '../controllers/apiController';

// GET request to retrieve all users
router.get('/getMessages', isLoggedIn, APIController.getMessages);
router.post('/createMessage', isLoggedIn, APIController.createMessage);

router.get('/getThreads', isLoggedIn, APIController.getThreads);
router.post('/createThread', isLoggedIn, APIController.createThread);
router.post('/updateThread', isLoggedIn, APIController.updateThread);
router.post('/deleteThread', isLoggedIn, APIController.deleteThread);

router.get('/getUser', isLoggedIn, APIController.getUser);

export default router;