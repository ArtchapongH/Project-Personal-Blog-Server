import express from "express";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import connectionPool from "../utils/db.mjs";
import commentRouter from "../routes/commentRouter.js";
import likeRouter from "../routes/likeRouter.js";

const app = express();
app.use("/comments", commentRouter);
app.use("/likes", likeRouter);

describe("notification routes", () => {
	beforeEach(() => {
		vi.spyOn(connectionPool, "query");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("GET /comments returns comments with article and user details", async () => {
		const comments = [{ post_id: 1, title: "Cats", comment_text: "Lovely", created_at: "2026-09-30T12:00:00Z", name: "Jacob Lash", profile_pic: "https://example.com/jacob.jpg" }];
		connectionPool.query.mockResolvedValue({ rows: comments });

		const response = await request(app).get("/comments");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ comments });
		expect(connectionPool.query).toHaveBeenCalledWith(expect.stringContaining("INNER JOIN comments"));
		expect(connectionPool.query.mock.calls[0][0]).toContain("u.profile_pic");
	});

	test("GET /likes returns likes with article and user details", async () => {
		const likes = [{ post_id: 1, title: "Cats", liked_at: "2026-09-30T12:00:00Z", name: "Jacob Lash", profile_pic: "https://example.com/jacob.jpg" }];
		connectionPool.query.mockResolvedValue({ rows: likes });

		const response = await request(app).get("/likes");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ likes });
		expect(connectionPool.query).toHaveBeenCalledWith(expect.stringContaining("INNER JOIN likes"));
		expect(connectionPool.query.mock.calls[0][0]).toContain("u.profile_pic");
	});
});