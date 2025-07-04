import express from 'express';
import { registerUser, loginUser, logoutUser} from '../controllers/loginController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/', loginUser);
router.get('/logout', logoutUser); 

export default router;