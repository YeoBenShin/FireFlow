import express from 'express';
import { registerUser, loginUser} from '../controllers/loginController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/', loginUser);

export default router;