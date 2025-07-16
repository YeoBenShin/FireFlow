import express from 'express'; 

import{
    getAllGoals, 
    createGoal, 
    updateGoal, 
    deleteGoal,
    allocateToGoals,
    getGoalsWithParticipants,
    getGoalParticipants
}from '../controllers/goalController';

const router = express.Router();

router.get('/', getAllGoals);
router.get('/with-participants', getGoalsWithParticipants);
router.get('/:goalId/participants', getGoalParticipants);
router.post('/create', createGoal);
router.post('/allocate', allocateToGoals);
router.delete('/delete/:id', deleteGoal);
router.put('/update/:id', updateGoal);


export default router;