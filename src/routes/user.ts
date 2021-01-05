import express from 'express';
import user from '../controllers/user';

const router = express.Router();

router
	.get('/', user.onGetAllUsers)
	.post('/', user.onCreateUser)
	.get('/:id', user.onGetUserById)
	.delete('/:id', user.onDeleteUserById);

export default router;
