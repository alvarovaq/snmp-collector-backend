import { Rule, WSMessage, WSEvent } from "../models";
import { logger } from "./logger.service";
import { RulesDBService } from "./rules-db.service";
import { WebSocketService } from "./websocket.service";
import { DevicesService } from './devices.service';

export class RulesService {
    private rules: Map<number, Rule> = new Map();

    constructor(private readonly devicesService: DevicesService) {
        this.loadRules();
    }

    private async loadRules(): Promise<void> {
        logger.info("Loading rules from BBDD", "RulesService");
        const rules = await RulesDBService.getRules();
        rules.forEach(rule => {
            this.rules.set(rule.id, rule);
        });
        logger.info(`${rules.length} rules loaded`, "RulesService");
    }

    public getRules(): Rule[] {
        return Array.from(this.rules.values());
    }

    public getRule(ruleId: number): Rule | undefined {
        return this.rules.get(ruleId);
    }

    public async addRule(rule: Rule): Promise<Rule | undefined> {
        const id = await RulesDBService.addRule(rule);
        if (id === -1)
            return undefined;

        const newRule: Rule = { ...rule, id };

        this.rules.set(id, newRule);
        const msg: WSMessage = {
            event: WSEvent.UpdateRule,
            data: newRule
        };
        WebSocketService.broadcast(msg);

        logger.info(`Rule added: ${newRule.name} (ID: ${id})`, "RulesService");

        return newRule;
    }

    public async updateRule(rule: Rule): Promise<Rule | undefined> {
        if (!this.rules.get(rule.id))
            return undefined;

        const ok = await RulesDBService.updateRule(rule);
        if (!ok)
            return undefined;

        this.rules.set(rule.id, rule);
        const msg: WSMessage = {
            event: WSEvent.UpdateRule,
            data: rule
        };
        WebSocketService.broadcast(msg);

        logger.info(`Rule updated: ${rule.name} (ID: ${rule.id})`, "RulesService");
        return rule;
    }

    public async removeRule(ruleId: number): Promise<boolean> {
        const rule = this.rules.get(ruleId);
        if (!rule)
            return false;

        const ok = await RulesDBService.removeRule(ruleId);
        if (!ok)
            return false;

        this.rules.delete(ruleId);

        this.devicesService.removeRule(ruleId);

        const msg: WSMessage = {
            event: WSEvent.RemoveRule,
            data: ruleId
        };
        WebSocketService.broadcast(msg);

        logger.info(`Rule removed: ${rule.name} (ID: ${ruleId})`, "RulesService");

        return true;
    }
}