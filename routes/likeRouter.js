import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/protect.js";

const likeRouter = Router();

likeRouter.get("/", async (_req, res) => {
	try {
		const result = await connectionPool.query(
			`SELECT p.id AS post_id, p.title, l.liked_at, u.name, u.profile_pic
			 FROM posts AS p
			 INNER JOIN likes AS l ON p.id = l.post_id
			 INNER JOIN users AS u ON l.user_id = u.id
			 ORDER BY l.liked_at DESC`
		);

		return res.status(200).json({ likes: result.rows });
	} catch {
		return res.status(500).json({ message: "Could not read likes" });
	}
});

likeRouter.get("/:postId/likes", async (req, res) => {
	try {
		const result = await connectionPool.query(
			"SELECT likes_count FROM posts WHERE id = $1",
			[req.params.postId]
		);

		if (!result.rows[0]) {
			return res.status(404).json({ message: "Post not found" });
		}

		return res.status(200).json({ likes_count: result.rows[0].likes_count });
	} catch {
		return res.status(500).json({ message: "Could not read post likes" });
	}
});

likeRouter.post("/:postId/likes", protect, async (req, res) => {
	const client = await connectionPool.connect();

	try {
		await client.query("BEGIN");

		const postExists = await client.query(
			"SELECT id FROM posts WHERE id = $1 FOR UPDATE",
			[req.params.postId]
		);

		if (!postExists.rows[0]) {
			await client.query("ROLLBACK");
			return res.status(404).json({ message: "Post not found" });
		}

		await client.query(
			`INSERT INTO likes (post_id, user_id, liked_at)
			 VALUES ($1, $2, NOW())
			 ON CONFLICT (post_id, user_id) DO NOTHING`,
			[req.params.postId, req.user.id]
		);
		const postResult = await client.query(
			`UPDATE posts
			 SET likes_count = (SELECT COUNT(*)::int FROM likes WHERE post_id = $1)
			 WHERE id = $1
			 RETURNING likes_count`,
			[req.params.postId]
		);

		await client.query("COMMIT");
		return res.status(200).json({ likes_count: postResult.rows[0].likes_count });
	} catch {
		await client.query("ROLLBACK");
		return res.status(500).json({ message: "Could not save post like" });
	} finally {
		client.release();
	}
});

export default likeRouter;