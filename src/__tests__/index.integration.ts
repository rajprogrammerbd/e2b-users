import appPort from '../../index';
import request from 'supertest';

jest.mock('../middlewares/winston', () => {
    return {
        logger: jest.fn()
    };
});

afterAll(() => {
    appPort.close();
});

test('GET - / - Success to retrieve homepage endpoint', async () => {
    const res = await request(appPort).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello' });
});

test('POST - / - Send Mail fail because of missing req.body', async () => {
    const res = await request(appPort).post('/api/email/send');

    // Check when user doesn't pass any request body.
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Request body is required' });
});

test('POST - / -  Send mail successfully', async () => {
    // That the function sends the email.
    const test2 = await request(appPort).post('/api/email/send').send({
        to: "rd2249619@gmail.com",
        title: "Send email for automation testing",
        html: "<b>Test has done successfully.</b>"
    });

    expect(test2.statusCode).toBe(200);
    expect(test2.body).toEqual({ message: 'Email has been successfully send to rd2249619@gmail.com' });
});
