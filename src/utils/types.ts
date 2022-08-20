import mongoose from 'mongoose';

export const createUserText = "Welcome to E2B Translator";
export const createUserHtml = "<b>Thank you for created an account in <a href='https://e2b-translator-be.herokuapp.com/'>E2B Translator</a></b>";

export interface FindUserResponseType {
    name: string;
    email: string;
    userName: string;
    AccessType: string;
}