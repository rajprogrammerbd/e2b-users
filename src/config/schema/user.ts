export type ACCESS_TYPE = 'Admin' | 'User' | 'Temp';

const userSchema = {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userName: { type: String, required: true },
    AccessType: { type: String, enum: ['Admin', 'User', 'Temp'] },
    createdTime: Date,
};

export default userSchema;
