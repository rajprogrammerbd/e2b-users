require('dotenv').config();
import express from 'express';
import Database from '../config/db.config';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import logger from './winston';

function isAccessible(req: express.Request, res: express.Response, next: express.NextFunction) {
    const isConnected = Database.isSuccess();
    if (isConnected) {
        if (req.headers.cookie !== undefined) {
            const cookies = cookie.parse(req.headers.cookie);
            try {
                if (cookies.LOGIN_ACCESS_COOKIE === process.env.ROOT_EMAIL) {
                    req.userEmail = process.env.ROOT_EMAIL;
                } else {
                    const parsedCookie: any = jwt.verify(cookies.LOGIN_ACCESS_COOKIE, process.env.JSON_PRIVATE_KEY as string);

                    req.userEmail = parsedCookie.email;
                }
            } catch (err: any) {
                res.status(401).send({ message: 'User needs to login' });
            }
        }
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
