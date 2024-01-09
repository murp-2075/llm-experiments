import express from 'express';
const router = express.Router();
const { logRequest } = require('../middleware/authMiddleware');


// Import the user controller
import UserController from '../controllers/userController';

router.use(logRequest)

// GET request to retrieve all users
// router.get('/', UserController.getAllUsers);

// GET request to retrieve a single user by ID
// router.get('/:id', UserController.getUserById);

// POST request to create a new user
// router.post('/', UserController.createUser);

// // PUT request to update an existing user
// router.put('/:id', UserController.updateUser);

// // DELETE request to delete a user
// router.delete('/:id', UserController.deleteUser);

export default router;
