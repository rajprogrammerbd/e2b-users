require('dotenv').config();
import userSchema from '../config/schema/user';
import Database from '../config/db.config';
import { hashSync } from 'bcrypt';
import logger from '../middlewares/winston';
import { ACCESS_TYPE } from '../config/schema/user';
import axios from 'axios';
import { createUserText, createUserHtml } from '../utils/static';


export const User = Database.prepare(userSchema, 'user');

axios.defaults.headers.common['Authorization'] = process.env.AUTHORIZATION_CODE as string || '';

interface IPerson {
    name: string;
    email: string;
    password: string;
    userName: string;
    userType: ACCESS_TYPE;
}

function createUser(person: IPerson): Promise<any> {
    const { name, email, password, userName, userType } = person;

    return new Promise(async (resolve, reject) => {
        const searchUser = await User.find({ email });
        if (searchUser.length > 0)  {
            reject({ message: 'User is already exist' });
        }

        const newUser = new User({
            name,
            email,
            password: hashSync(password, 10),
            createdTime: Date.now(),
            userName,
            AccessType: userType
        });

        let res: any;
    
        try {
            res = await newUser.save();
        } catch (err: any) {
            logger.error(err);
            return reject({ message: err.message });
        }

        await axios.post(`${process.env.EMAIL_REPO_ACCESS_URL as string}/api/email/send`, {
            to: res.email,
            title: createUserText,
            html: createUserHtml,
        }).then(() => {
            return resolve({
                success: true,
                message: 'User created successfully',
                user: { name: res.name, email: res.email }
            });
        }).catch(async err => {
            logger.error({ message: 'Failed to send mail' });
            await User.findOneAndRemove({ email: res.email }, (err: any) => console.error('unknown error ', err));
            return reject(err.response.data);
        });
    });
}

export default {
    createUser
}
