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
