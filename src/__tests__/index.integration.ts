import { User } from './../services/userCredential.service';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import request from 'supertest';
import appPort from '../../index';

const URL = process.env.MONGODB_ACCESS_URL as string;

jest.mock('../middlewares/winston', () => ({
    __esModule: true,
    default: {
        error: jest.fn()
    }
}))

beforeEach((done) => {
    mongoose.connect(URL).then(() => done());
});

afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
        appPort.close();
        mongoose.connection.close(() => done());
    });
});

const defaultAgent = new Proxy(request(appPort), {
    get: (target, name) => (...args: any[]) =>
      (target as any)[name](...args).set({
        'Authorization': process.env.AUTHORIZATION_CODE as string
    })
});

test('GET - / - Success to retrieve homepage endpoint', async () => {
    const res = await defaultAgent.get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello' });
});

test('POST - /auth/create - Failed to create a user', async () => {
    const res = await defaultAgent.post('/auth/create').send({
        password: "Casino@123",
        userName: "rajprogrammerbd",
        userType: "Admin"
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
        message: 'User needs to send all required data'
    });
});

test('POST - /auth/create - Successfully Create an user account.', async () => {
    const name = faker.name.fullName();
    const email = 'rajd50843@gmail.com';

    const res = await defaultAgent.post('/auth/create').send({
        name,
        email,
        password: "Casino@123",
        userName: "rajprogrammerbd",
        userType: "Admin"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
        success: true,
        message: 'User created successfully',
        user: { name, email }
    });

    const userExisted = await defaultAgent.post('/auth/create').send({
        name,
        email,
        password: "Casino@123",
        userName: "rajprogrammerbd",
        userType: "Admin"
    });

    expect(userExisted.statusCode).toBe(500);
    expect(userExisted.body).toEqual({ message: "User is already exist" });

    await User.deleteOne({ email });
});

test('POST - /auth/find - Find a user', async () => {
    const name = faker.name.fullName();
    const email = 'rajd50843@gmail.com';

    // Creating an account
    const res = await defaultAgent.post('/auth/create').send({
        name,
        email,
        password: "Casino@123",
        userName: "rajprogrammerbd",
        userType: "Admin"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
        success: true,
        message: 'User created successfully',
        user: { name, email }
    });

    // Can't find a user.
    const failedToFind = await defaultAgent.post('/auth/find').send({
        email: faker.internet.email()
    });

    expect(failedToFind.statusCode).toBe(500);
    expect(failedToFind.body).toEqual({
        message: "Couldn't able to find a user"
    });

    const SuccessToFind = await defaultAgent.post('/auth/find').send({
        email
    });

    expect(SuccessToFind.statusCode).toBe(200);
    expect(SuccessToFind.body).toEqual({
        name,
        email,
        userName: "rajprogrammerbd",
        AccessType: "Admin"
    });

    await User.deleteOne({ email });
});