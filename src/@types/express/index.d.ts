declare global {
    namespace Express {
        interface Request {
            isAccessible: boolean;
        }
    }
}

export = global;
