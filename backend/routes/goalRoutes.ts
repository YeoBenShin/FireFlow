import express from 'express'; 

import{
    getAllGoals, 
    createGoal, 
    updateGoal, 
    deleteGoal,
    getGoalsWithParticipants,
    getGoalParticipants,
    getPendingInvitations,
    acceptInvitation,
    rejectInvitation
}from '../controllers/goalController';

const router = express.Router();

router.get('/', getAllGoals);
router.get('/with-participants', getGoalsWithParticipants);
router.get('/pending-invitations', getPendingInvitations);
router.get('/:goalId/participants', getGoalParticipants);
router.post('/create', createGoal);
router.post('/:goalId/accept-invitation', acceptInvitation);
router.post('/:goalId/reject-invitation', rejectInvitation);
router.delete('/delete/:id', deleteGoal);
router.put('/update/:id', updateGoal);


export default router;