import { User } from "../models";
import { logger } from "./logger.service";
import { UsersDBService } from "./users-db.service";
import { AuthenticationService } from './authentication.service';

export class UsersService {
    constructor(private readonly authenticationService: AuthenticationService) {
    }

    public async getUsers(): Promise<User[]> {
        return await UsersDBService.getUsers();
    }

    public async getUser(userId: number): Promise<User | undefined> {
        return await UsersDBService.getUser(userId);
    }

    public async addUser(user: User): Promise<User | undefined> {
        const id = await UsersDBService.addUser(user);
        if (id === -1)
            return undefined;

        const newUser: User = { ...user, id };
        this.authenticationService.add(newUser);

        logger.info(`User added: ${user.email} (ID: ${id})`, "UsersService");

        return newUser;
    }

    public async updateUser(user: User): Promise<User | undefined> {
        const ok = await UsersDBService.updateUser(user);
        if (!ok)
            return undefined;

        logger.info(`User updated: ${user.email} (ID: ${user.id})`, "UsersService");
        return user;
    }

    public async removeUser(userId: number): Promise<boolean> {
        const ok = await UsersDBService.removeUser(userId);
        if (!ok)
            return false;

        logger.info(`User removed: (ID: ${userId})`, "UsersService");

        return true;
    }
}