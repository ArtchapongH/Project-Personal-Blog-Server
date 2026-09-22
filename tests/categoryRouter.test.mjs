import express from "express";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import connectionPool from "../utils/db.mjs";
import categoryRouter from "../routes/categoryRouter.mjs";

const app = express();
app.use(express.json());
app.use("/categories", categoryRouter);

describe("category routes", () => {
  beforeEach(() => {
    vi.spyOn(connectionPool, "query");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("GET /categories returns database categories", async () => {
    connectionPool.query.mockResolvedValue({
      rows: [{ id: 1, name: "General" }],
    });

    const response = await request(app).get("/categories");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      categories: [{ id: 1, name: "General" }],
    });
  });

  test("POST /categories creates a trimmed category name", async () => {
    connectionPool.query.mockResolvedValue({
      rows: [{ id: 2, name: "Travel" }],
    });

    const response = await request(app)
      .post("/categories")
      .send({ name: "  Travel  " });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ category: { id: 2, name: "Travel" } });
    expect(connectionPool.query).toHaveBeenCalledWith(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
      ["Travel"]
    );
  });

  test("PATCH /categories/:categoryId updates a trimmed category name", async () => {
    connectionPool.query.mockResolvedValue({
      rows: [{ id: 2, name: "Travel guides" }],
    });

    const response = await request(app)
      .patch("/categories/2")
      .send({ name: "  Travel guides  " });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      category: { id: 2, name: "Travel guides" },
    });
    expect(connectionPool.query).toHaveBeenCalledWith(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
      ["Travel guides", 2]
    );
  });

  test("DELETE /categories/:categoryId deletes the category", async () => {
    connectionPool.query.mockResolvedValue({
      rows: [{ id: 2, name: "Travel" }],
    });

    const response = await request(app).delete("/categories/2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ category: { id: 2, name: "Travel" } });
    expect(connectionPool.query).toHaveBeenCalledWith(
      "DELETE FROM categories WHERE id = $1 RETURNING id, name",
      [2]
    );
  });
});