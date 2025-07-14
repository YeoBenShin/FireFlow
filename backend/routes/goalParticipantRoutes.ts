
import{
    getGoalParticipants, 
    createGoalParticipant, 
    updateGoalParticipant, 
    deleteGoalParticipant   
}from '../controllers/goalParticipantController';

const router = express.Router();

router.get('/', getGoalParticipants);
router.post('/create', createGoalParticipant);
router.delete('/delete/:id', deleteGoalParticipant);
router.put('/update/:id', updateGoalParticipant);


export default router;