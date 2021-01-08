import { Router } from 'express';
import models from './models';

const router = Router();

router.get('/', (req, res) => {
	res.send('Welcome to Chat Backend!');
});

export default router;
