import express from "express";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import connectionPool from "../utils/db.mjs";
import postRouter from "../routes/postRouter.js";

const app = express();
app.use(express.json());
app.use("/posts", postRouter);

const validPost = {
  title: "My First Post",
  image: "https://example.com/cover.jpg",
  category_id: 1,
  description: "This is my first post.",
  content: "This is the content of my first post.",
  status_id: 1,
};

describe("<POST http://localhost:4000/posts> (integration)", () => {
  beforeEach(() => {
    vi.spyOn(connectionPool, "query").mockResolvedValue({ rows: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Happy Path: creates a post and returns a success message", async () => {
    const res = await request(app).post("/posts").send(validPost);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "Created post successfully" });
    expect(connectionPool.query).toHaveBeenCalledWith(
      expect.stringContaining("insert into posts"),
      [
        validPost.title,
        validPost.image,
        validPost.category_id,
        validPost.description,
        validPost.content,
        validPost.status_id,
      ]
    );
  });

  test("Error: returns 400 when title is missing", async () => {
    const { title, ...postWithoutTitle } = validPost;

    const res = await request(app).post("/posts").send(postWithoutTitle);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Title is required" });
    expect(connectionPool.query).not.toHaveBeenCalled();
  });
});