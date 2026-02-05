import jwt from "jsonwebtoken";
import { getPayloadData, verifyToken, splitBearerToken } from "../auth";

jest.mock("../../config/env", () => ({
	env: {
		auth: {
			jwtSecret: "test-secret"
		}
	}
}));

describe("Auth utils", () => {

	describe("getPayloadData", () => {
		it("should return payload data without exp and iat", () => {
			const token = jwt.sign(
				{ userId: "123", role: "admin" },
				"test-secret",
				{ expiresIn: "1h" }
			);

			const payload = getPayloadData(token);

			expect(payload).toEqual({
				userId: "123",
				role: "admin"
			});
		});

		it("should return undefined for invalid token", () => {
			const payload = getPayloadData("invalid.token.value");
			expect(payload).toBeUndefined();
		});
	});

  	describe("verifyToken", () => {
    	it("should return true for a valid token", () => {
			const token = jwt.sign(
				{ userId: "123" },
				"test-secret",
				{ expiresIn: "1h" }
			);

			const result = verifyToken(token);
			expect(result).toBe(true);
		});

		it("should return false for an invalid token", () => {
			const result = verifyToken("invalid.token.value");
			expect(result).toBe(false);
		});

		it("should return false for token signed with wrong secret", () => {
			const token = jwt.sign(
				{ userId: "123" },
				"wrong-secret"
			);

			const result = verifyToken(token);
			expect(result).toBe(false);
		});
	});

	describe("splitBearerToken", () => {
		it("should extract token from Bearer header", () => {
			const result = splitBearerToken("Bearer abc.def.ghi");
			expect(result).toBe("abc.def.ghi");
		});

		it("should return undefined if header does not start with Bearer", () => {
			const result = splitBearerToken("Token abc.def.ghi");
			expect(result).toBeUndefined();
		});

		it("should return undefined if bearer is undefined", () => {
			const result = splitBearerToken(undefined);
			expect(result).toBeUndefined();
		});
	});

});
