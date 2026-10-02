import {Router} from "express";
import connectionPool from "../utils/db.mjs";
import {protect} from "../middlewares/protect.js";

const commentRouter = Router();

commentRouter.get("/", async (_req, res) => {
	try {
		const result = await connectionPool.query(
			`SELECT p.id AS post_id, p.title, c.comment_text, c.created_at, u.name, u.profile_pic
			 FROM posts AS p
			 INNER JOIN comments AS c ON p.id = c.post_id
			 INNER JOIN users AS u ON c.user_id = u.id
			 ORDER BY c.created_at DESC`
		);

		return res.status(200).json({ comments: result.rows });
	} catch {
		return res.status(500).json({ message: "Could not read comments" });
	}
});

// read all comments by post id
commentRouter.get("/:postId/comments", async (req, res) => {
	try {
		const result = await connectionPool.query(
			`SELECT comments.id, comments.post_id, comments.user_id, comments.comment_text, comments.created_at,
			        users.name, users.username
			 FROM comments
			 JOIN users ON users.id = comments.user_id
			 WHERE comments.post_id = $1
			 ORDER BY comments.created_at ASC`,
			[req.params.postId]
		);

		return res.status(200).json({ comments: result.rows });
	} catch {
		return res.status(500).json({ message: "Could not read post comments" });
	}
});

// create comment by post id
commentRouter.post("/:postId/comments", protect, async (req, res) => {
	const commentText = req.body?.comment_text;

	if (!commentText || !commentText.trim()) {
		return res.status(400).json({ message: "comment_text is required" });
	}

	try {
		const postExists = await connectionPool.query(
			"SELECT id FROM posts WHERE id = $1",
			[req.params.postId]
		);

		if (!postExists.rows[0]) {
			return res.status(404).json({ message: "Post not found" });
		}

		const result = await connectionPool.query(
			`INSERT INTO comments (post_id, user_id, comment_text, created_at)
			 VALUES ($1, $2, $3, NOW())
			 RETURNING id, post_id, user_id, comment_text, created_at`,
			[req.params.postId, req.user.id, commentText.trim()]
		);

		return res.status(201).json({ comment: result.rows[0] });
	} catch {
		return res.status(500).json({ message: "Could not save comment" });
	}
});

export default commentRouter;