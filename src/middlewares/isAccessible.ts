import express from 'express';
import Database from '../config/db.config';
import logger from './winston';
require('dotenv').config();

function isAccessible(req: express.Request, res: express.Response, next: express.NextFunction) {
    const isConnected = Database.isSuccess();

    if (isConnected) {
        if (req.headers.authorization !== undefined) {
            if (req.headers.authorization === process.env.AUTHORIZATION_CODE) {
                req.isAccessible = true;
            } else req.isAccessible = false;
        } else {
            req.isAccessible = false;
            res.status(401).json({ message: "You don't have permission to access it." });
        }

        next();
    } else {
        logger.error({ message: 'Failed to connect with the database' });
        res.status(500).json({ message: "You don't have access." });
    }
}

export default isAccessible;
