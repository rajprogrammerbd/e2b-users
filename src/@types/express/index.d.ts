declare global {
    namespace Express {
        interface Request {
            isAccessible: boolean;
            userEmail: string;
        }
    }
}

export = global;
