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
            return "-";
    }  
};

const requiredNumber = (operator: Operator): boolean => {
    switch (operator) {
        case Operator.GREATER_THAN:
        case Operator.GREATER_OR_EQUAL:
        case Operator.LESS_THAN:
        case Operator.LESS_OR_EQUAL:
            return true;
        case Operator.EQUAL:
        case Operator.NOT_EQUAL:
        default:
            return false;
    }  
};

export const checkRule = (value: string | null, rule: Rule): boolean => {
    if (value === null || value.trim() === "")
        return false;

    const nValue = Number(value);
    const nThreshold = Number(rule.threshold);

    if (requiredNumber(rule.operator) && (Number.isNaN(nValue) || Number.isNaN(nThreshold)))
        return false;

    switch (rule.operator)
    {
        case Operator.GREATER_THAN:
            return nValue > nThreshold;
        case Operator.GREATER_OR_EQUAL:
            return nValue >= nThreshold;
        case Operator.LESS_THAN:
            return nValue < nThreshold;
        case Operator.LESS_OR_EQUAL:
            return nValue <= nThreshold;
        case Operator.EQUAL:
            return nValue === nThreshold;
        case Operator.NOT_EQUAL:
            return nValue !== nThreshold;
        default:
            return false;
    }
};