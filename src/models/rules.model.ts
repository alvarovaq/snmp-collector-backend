export enum Severity {
    INFO = "info",
    WARNING = "warning",
    MINOR = "minor",
    MAJOR = "major",
    CRITICAL = "critical"
}

export enum Operator {
    GREATER_THAN = ">",
    GREATER_OR_EQUAL = ">=",
    LESS_THAN = "<",
    LESS_OR_EQUAL = "<=",
    EQUAL = "==",
    NOT_EQUAL = "!="
}

export interface Rule {
    id: number;
    name: string;
    operator: Operator;
    threshold: string;
    severity: Severity;
}