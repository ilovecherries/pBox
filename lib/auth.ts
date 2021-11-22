import bcrypt from 'bcrypt';
import { User } from '../views/User';
import prisma from './prisma';

const saltRounds = 10;

/**
 * Authenticates the user.
 * @param credentials The credentials that are used to login
 * @returns The user that has been authenticated
 */
export async function login(username: string, password: string): Promise<User | undefined> {
    return prisma.user.findUnique({
        where: {
            username: username,
        }
    }).then((user: Partial<User> | null | undefined) => {
        if (user === null || user === undefined) {
            throw new Error('User not found');
        }

        const userD = new User(user as Partial<User>);

        // check with bcrypt against the user's password
        return bcrypt.hash(password, userD.salt)
            .then(hash => {
                    if (hash !== user.hashed_password) {
                        throw new Error('Incorrect password');
                    }
                    return userD!;
                });
    });
}

/**
 * Registers a new user into the database.
 * @param credentials The credentials that are used to register a new user
 * @returns The newly created user
 */
export async function register(username: string, password: string): Promise<User>
{
    // check if a user with the username already exists
    return prisma.user.findUnique({
        where: {
            username: username,
        }
    }).then((checkDuplicate: Partial<User> | null) => {
        if (checkDuplicate !== null) {
            throw new Error('User with this username already exists');
        }

        // hash the password
        return bcrypt.genSalt(saltRounds)
            .then(salt => bcrypt.hash(password, salt)
                .then(hashedPassword => prisma.user.create({
                    data: {
                        username: username,
                        operator: false,
                        hashed_password: hashedPassword,
                        salt: salt
                    }}).then((user: Partial<User>) => new User(user))));
    });
}