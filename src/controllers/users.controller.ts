import { Request, Response } from "express";
import { logger, usersService } from "../services";
import { User } from "../models";

export class UsersController {
    public static async getAll(req: Request, res: Response) {
        try {
            const users = await usersService.getUsers();
            res.status(200).json(users);
        } catch (err) {
            logger.error("Failed to get users", "UsersController", err);
            res.status(500).json();
        }
    }
    
    public static async get(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const user = await usersService.getUser(id);
            
            if (!user) {
                return res.status(400).json();
            }

            res.status(200).json(user);
        } catch (err) {
            logger.error("Failed to get user", "UsersController", err);
            res.status(500).json();
        }
    }

    public static async add(req: Request, res: Response) {
        try {
            const user: User = req.body;

            const newUser = await usersService.addUser(user);
            if (!newUser)
                return res.status(400).json();
            return res.status(200).json(newUser);
        } catch (err) {
            logger.error("Failed to add user", "UsersController", err);
            res.status(500).json();
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const user: User = req.body;

            const updUser = await usersService.updateUser(user);
            if (!updUser)
                return res.status(400).json();
            return res.status(200).json(updUser);
        } catch (err) {
            logger.error("Failed to update user", "UsersController", err);
            res.status(500).json();
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const ok = await usersService.removeUser(id);
            if (!ok)
                res.status(404).json();

            res.status(200).json();
        } catch (err) {
            logger.error("Failed to remove user", "UsersController", err);
            res.status(500).json();
        }
    }
}
