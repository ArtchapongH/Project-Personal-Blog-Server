import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const categoryRouter = Router();

categoryRouter.get("/", async (_req, res) => {
  try {
    const result = await connectionPool.query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );
    return res.status(200).json({ categories: result.rows });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve categories" });
  }
});

categoryRouter.post("/", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const result = await connectionPool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
      [name]
    );
    return res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    return res.status(500).json({ message: "Unable to create category" });
  }
});

categoryRouter.patch("/:categoryId", async (req, res) => {
  const categoryId = Number(req.params.categoryId);
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return res.status(400).json({ message: "A valid category ID is required" });
  }

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const result = await connectionPool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
      [name, categoryId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    return res.status(500).json({ message: "Unable to update category" });
  }
});

categoryRouter.delete("/:categoryId", async (req, res) => {
  const categoryId = Number(req.params.categoryId);

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return res.status(400).json({ message: "A valid category ID is required" });
  }

  try {
    const result = await connectionPool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id, name",
      [categoryId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        message: "This category cannot be deleted because it is used by posts",
      });
    }
    return res.status(500).json({ message: "Unable to delete category" });
  }
});

export default categoryRouter;