import express from 'express';
import userCredentialService from "../services/userCredential.service";
import logger from '../middlewares/winston';

async function saveUser(req: express.Request, res: express.Response) {
    try {
        const { name, email, password, userName, userType } = req.body;

        if (name !== undefined && email !== undefined && password !== undefined && userName !== undefined && userType !== undefined) {
            const person = { name, email, password, userName, userType };

            try {
                if (userType !== "Temp") {
                    const response = await userCredentialService.createUser(person);
                    res.send(response);
                } else res.status(401).send({ message: "User doesn't have permission to create" });

            } catch(err: any) {
                res.status(500).send(err);
            }

        } else res.status(404).send({ message: 'User needs to send all required data' });

    } catch (err: any) {
        logger.error(err);
        throw new Error(err);
    }
}

async function findAUser(req: express.Request, res: express.Response) {
    const { email } = req.body;
    if ( email !== undefined ) {
        try {
            await userCredentialService.findUser(email).then((user: any) => {
                delete user.password;

                res.send(user);
            });
        } catch(err: any) {
            res.status(500).send(err);
        }
    } else res.status(404).send({ message: 'User needs to send email' });
}

async function deleteAUser(req: express.Request, res: express.Response) {
    const { email } = req.body;
    if ( email !== undefined ) {
        try {
            let deleting_user_email: any;
            let loggedIn_user_email: any;
            let deleted: any;

            if ( email.toLowerCase() === req.userEmail ) {
                deleting_user_email = await userCredentialService.findUser(email);
                loggedIn_user_email = deleting_user_email;
                deleted = await userCredentialService.deleteUser(loggedIn_user_email, deleting_user_email, true);
            } else {
                deleting_user_email = await userCredentialService.findUser(email);
                loggedIn_user_email = await userCredentialService.findUser(req.userEmail);
                deleted = await userCredentialService.deleteUser(loggedIn_user_email, deleting_user_email, false);
            }

            res.send(deleted);
        } catch (err) {
            res.status(500).send(err);
        }

    } else  {
        res.status(404).send({ message: 'User need to pass the email body' });
    }
}

async function loginAUser(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    if ( email !== undefined && password !== undefined ) {
        try {
            await userCredentialService.loginUser(email, password).then((user: any) => {
                res.send(user);
            });
        } catch(err: any) {
            res.status(500).send({ message: err.message });
        }
    } else res.status(404).send({ message: 'User needs to send required data' });
}

export default {
    saveUser,
    findAUser,
    deleteAUser,
    loginAUser
}
