import express from 'express'; 

import{
    getAllGoals, 
    createGoal, 
    updateGoal, 
    deleteGoal,
    getGoalsWithParticipants,
    getGoalParticipants,
    getCurrentAmounts,
    allocateToGoals
}from '../controllers/goalController';

const router = express.Router();

router.get('/', getAllGoals);
router.get('/with-participants', getGoalsWithParticipants);
router.get('/current-amounts', getCurrentAmounts);
router.get('/:goalId/participants', getGoalParticipants);
router.post('/create', createGoal);
router.delete('/delete/:id', deleteGoal);
router.put('/update/:id', updateGoal);
router.post('/allocate', allocateToGoals); 




export default router;