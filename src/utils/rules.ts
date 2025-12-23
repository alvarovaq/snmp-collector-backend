import { Rule, Operator } from "../models";

export const ruleToString = (rule: Rule): string => {
    switch (rule.operator) {
        case Operator.GREATER_THAN:
            return `Mayor que ${rule.threshold}`;
        case Operator.GREATER_OR_EQUAL:
            return `Mayor o igual que ${rule.threshold}`;
        case Operator.LESS_THAN:
            return `Menor que ${rule.threshold}`;
        case Operator.LESS_OR_EQUAL:
            return `Menor o igual que ${rule.threshold}`;
        case Operator.EQUAL:
            return `Igual a ${rule.threshold}`;
        case Operator.NOT_EQUAL:
            return `Distinto de ${rule.threshold}`;
        default:
            const exhaustiveCheck: never = rule.operator;
            return exhaustiveCheck;
    }  
};