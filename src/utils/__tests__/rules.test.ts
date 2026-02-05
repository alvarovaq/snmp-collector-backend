import { ruleToString, checkRule } from "../rules";
import { Operator, Rule, Severity } from "../../models";

describe("ruleToString", () => {
    const baseRule = {
        id: 1,
        name: "Test Rule",
        severity: Severity.INFO,
    };

    it("should return correct string for GREATER_THAN", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_THAN, threshold: "10" };
        expect(ruleToString(rule)).toBe("Mayor que 10");
    });

    it("should return correct string for GREATER_OR_EQUAL", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_OR_EQUAL, threshold: "10" };
        expect(ruleToString(rule)).toBe("Mayor o igual que 10");
    });

    it("should return correct string for LESS_THAN", () => {
        const rule: Rule = { ...baseRule, operator: Operator.LESS_THAN, threshold: "10" };
        expect(ruleToString(rule)).toBe("Menor que 10");
    });

    it("should return correct string for LESS_OR_EQUAL", () => {
        const rule: Rule = { ...baseRule, operator: Operator.LESS_OR_EQUAL, threshold: "10" };
        expect(ruleToString(rule)).toBe("Menor o igual que 10");
    });

    it("should return correct string for EQUAL", () => {
        const rule: Rule = { ...baseRule, operator: Operator.EQUAL, threshold: "10" };
        expect(ruleToString(rule)).toBe("Igual a 10");
    });

    it("should return correct string for NOT_EQUAL", () => {
        const rule: Rule = { ...baseRule, operator: Operator.NOT_EQUAL, threshold: "10" };
        expect(ruleToString(rule)).toBe("Distinto de 10");
    });
});

describe("checkRule", () => {
    const baseRule = {
        id: 1,
        name: "Test Rule",
        severity: Severity.INFO,
    };

    it("should return false for null value", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_THAN, threshold: "10" };
        expect(checkRule(null, rule)).toBe(false);
    });

    it("should return false for empty value", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_THAN, threshold: "10" };
        expect(checkRule("   ", rule)).toBe(false);
    });

    it("should return false for non numeric value when number is required", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_THAN, threshold: "10" };
        expect(checkRule("abc", rule)).toBe(false);
    });

    it("should validate GREATER_THAN correctly", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_THAN, threshold: "10" };
        expect(checkRule("15", rule)).toBe(true);
        expect(checkRule("5", rule)).toBe(false);
    });

    it("should validate GREATER_OR_EQUAL correctly", () => {
        const rule: Rule = { ...baseRule, operator: Operator.GREATER_OR_EQUAL, threshold: "10" };
        expect(checkRule("10", rule)).toBe(true);
        expect(checkRule("9", rule)).toBe(false);
    });

    it("should validate LESS_THAN correctly", () => {
        const rule: Rule = { ...baseRule, operator: Operator.LESS_THAN, threshold: "10" };
        expect(checkRule("5", rule)).toBe(true);
        expect(checkRule("15", rule)).toBe(false);
    });

    it("should validate LESS_OR_EQUAL correctly", () => {
        const rule: Rule = { ...baseRule, operator: Operator.LESS_OR_EQUAL, threshold: "10" };
        expect(checkRule("10", rule)).toBe(true);
        expect(checkRule("11", rule)).toBe(false);
    });

    it("should validate EQUAL correctly", () => {
        const rule: Rule = { ...baseRule, operator: Operator.EQUAL, threshold: "10" };
        expect(checkRule("10", rule)).toBe(true);
        expect(checkRule("9", rule)).toBe(false);
    });

    it("should validate NOT_EQUAL correctly", () => {
        const rule: Rule = { ...baseRule, operator: Operator.NOT_EQUAL, threshold: "10" };
        expect(checkRule("9", rule)).toBe(true);
        expect(checkRule("10", rule)).toBe(false);
    });
});
