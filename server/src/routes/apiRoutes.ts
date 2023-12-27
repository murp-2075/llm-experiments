import express from 'express';
const router = express.Router();
const { authMiddleware, isLoggedIn } = require('../middleware/authMiddleware');

import multer from 'multer';
const storage = multer.memoryStorage(); // This will store files in memory
const upload = multer({ storage: storage });

// Import the api controller
import APIController from '../controllers/apiController';

// GET request to retrieve all users
router.get('/getMessages', isLoggedIn, APIController.getMessages);
router.post('/createMessage', isLoggedIn, APIController.createMessage);
router.post('/createMessageFromAudio', isLoggedIn, upload.single('content'), APIController.createMessageFromAudio);
router.get('/getAudioFile/:messageId', isLoggedIn, APIController.getAudioFile);

router.get('/getThreads', isLoggedIn, APIController.getThreads);
router.get('/autoNameThread', isLoggedIn, APIController.autoNameThread);
router.post('/createThread', isLoggedIn, APIController.createThread);
router.post('/updateThread', isLoggedIn, APIController.updateThread);
router.post('/deleteThread', isLoggedIn, APIController.deleteThread);

router.get('/getUser', isLoggedIn, APIController.getUser);

export default router;