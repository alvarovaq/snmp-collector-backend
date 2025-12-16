import { Request, Response } from "express";
import { logger, rulesService } from "../services";
import { Rule } from "../models";

export class RulesController {
    public static async getAll(req: Request, res: Response) {
        try {
            const rules = rulesService.getRules();
            res.status(200).json(rules);
        } catch (err) {
            logger.error("Failed to get rules", "RulesController", err);
            res.status(500).json();
        }
    }
    
    public static async get(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const rule = rulesService.getRule(id);
            
            if (!rule) {
                return res.status(400).json();
            }

            res.status(200).json(rule);
        } catch (err) {
            logger.error("Failed to get rule", "RulesController", err);
            res.status(500).json();
        }
    }

    public static async add(req: Request, res: Response) {
        try {
            const rule: Rule = req.body;

            const newRule = await rulesService.addRule(rule);
            if (!newRule)
                return res.status(400).json();
            return res.status(200).json(newRule);
        } catch (err) {
            logger.error("Failed to add rule", "RulesController", err);
            res.status(500).json();
        }
    }

    public static async update(req: Request, res: Response) {
        try {
            const rule: Rule = req.body;

            const updRule = await rulesService.updateRule(rule);
            if (!updRule)
                return res.status(400).json();
            return res.status(200).json(updRule);
        } catch (err) {
            logger.error("Failed to update rule", "RulesController", err);
            res.status(500).json();
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const ok = await rulesService.removeRule(id);
            if (!ok)
                res.status(404).json();

            res.status(200).json();
        } catch (err) {
            logger.error("Failed to remove rule", "RulesController", err);
            res.status(500).json();
        }
    }
}
