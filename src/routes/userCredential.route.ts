import express from 'express';
// import passport from 'passport';
const router = express.Router();
import userCredential from '../controllers/userCredential.controllers';

router.post('/create', userCredential.saveUser);

router.post('/find', userCredential.findAUser);

router.delete('/delete', userCredential.deleteAUser);

router.post('/login', userCredential.loginAUser);

export default router;
