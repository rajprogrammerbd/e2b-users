require('dotenv').config();
import userSchema from '../config/schema/user';
import Database from '../config/db.config';
import { hashSync, compareSync } from 'bcrypt';
import logger from '../middlewares/winston';
import { ACCESS_TYPE } from '../config/schema/user';
import axios, { AxiosError } from 'axios';
import jwt from "jsonwebtoken";
import { createUserText, createUserHtml, FindUserResponseType } from '../utils/types';


export const User = Database.prepare(userSchema, 'user');

axios.defaults.headers.common['Authorization'] = process.env.AUTHORIZATION_CODE as string || '';

interface IPerson {
    name: string;
    email: string;
    password: string;
    userName: string;
    userType: ACCESS_TYPE;
}

function findUser(email: string): Promise<FindUserResponseType>{
    return new Promise(async (resolve, reject) => {
        await User.find({ email }).then((res: any) => {
            
            if (res.length === 1) {
                const { name, email, userName, AccessType, password } = res[0];
                const main = { name, userEmail: email, userName, AccessType,  password};
                
                resolve(main);
            } else reject({ message: "Couldn't able to find a user" });

        });
    });
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

function deleteUser(loggedInUser: FindUserResponseType, deleteableUser: FindUserResponseType, same: boolean = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const userType = {
            admin: 'Admin',
            user: 'User',
            temp: 'Temp'
        };

        try {
            if (same) {
                if (loggedInUser.AccessType !== userType.temp) {
                    const d = await User.findOneAndRemove({ email: loggedInUser.userEmail });
                    resolve({ message: `${d.name} has been deleted` });
                } else {
                    reject({ message: "User doesn't have permission to delete" });
                }
            } else {
                if ( loggedInUser.AccessType === userType.admin ) {
                    const d = await User.findOneAndRemove({ email: deleteableUser.userEmail });
                    resolve({ message: `${d.name} has been deleted` });
                } else {
                    reject({ message: "User doesn't have permission to delete" });
                }
            }
        } catch (err) {
            reject(err);
        }
    });
}

function loginUser(email: string, password: string) {
    return User.findOne({ email }).then((user: any) => {
        if (!user) {
            throw new Error("Couldn't able to find user");
        }

        if (!compareSync(password, user.password)) {
            throw new Error("Incorrect passport");
        }

        const payload = {
            email: user.email,
            id: user._id
        };

        const token = jwt.sign(payload, process.env.JSON_PRIVATE_KEY as string, { expiresIn: '1d' });

        return {
            success: true,
            name: user.name,
            userEmail: user.email,
            token: token,
            AccessType: user.AccessType,
        };
    });
}

export default {
    createUser,
    findUser,
    deleteUser,
    loginUser
}
