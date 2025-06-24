import express from 'express'; 

import{
    getAllGoals, 
    createGoal, 
    //getGoalById, 
    updateGoal, 
    deleteGoal
}from '../controllers/goalController';

const router = express.Router();

router.get('/', getAllGoals);
router.post('/create', createGoal);
router.delete('/delete:id', deleteGoal);
router.put('/update:id', updateGoal);
//router.get('/get:id' getGoalById); 


export default router;