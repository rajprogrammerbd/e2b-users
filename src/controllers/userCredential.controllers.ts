import express from 'express';
import userCredentialService from "../services/userCredential.service";
import logger from '../middlewares/winston';

async function saveUser(req: express.Request, res: express.Response) {
    try {
        const { name, email, password, userName, userType } = req.body;

        if (name !== undefined && email !== undefined && password !== undefined && userName !== undefined && userType !== undefined) {
            const person = { name, email, password, userName, userType };

            try {
                const response = await userCredentialService.createUser(person);
                res.send(response);
            } catch(err: any) {
                res.status(500).send(err);
            }

        } else res.status(404).send({ message: 'User needs to send all required data' });

    } catch (err: any) {
        logger.error(err);
        throw new Error(err);
    }
}

export default {
    saveUser,
}
