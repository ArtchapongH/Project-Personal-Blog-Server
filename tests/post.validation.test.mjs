// <path ไฟล์ test ที่เพิ่งสร้าง> เช่น server/tests/post.validation.test.mjs
import { describe, test, expect, vi } from "vitest";
// import { <ชื่อ Validation ที่สร้างไว้> } from "<path ที่เพิ่งสร้างไว้>";
import postValidation from "../middlewares/postValidation.js"

const makeRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
});

const validBody = {
  title: "My First Post",
  image: "https://example.com/cover.jpg",
  category_id: 1,
  description: "This is my first post.",
  content: "This is the content of my first post.",
  status_id: 1,
};


describe("postValidation", () => {
  test("Happy: validBody → next()", () => {
    const req = { body: { ...validBody } };
    const res = makeRes();
    const next = vi.fn();

    // <เรียก Validation ที่สร้างไว้>(req, res, next);
    postValidation(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Error: ไม่ส่ง title → 400", () => {
    const req = { body: { ...validBody, title: undefined } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });


  test("Error: title '' → 400", () => {
    const req = { body: { ...validBody, title: "" } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("Error: category_id '1' → 400", () => {
    const req = { body: { ...validBody, category_id: "1" } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  
  test("Error: title '   ' → 400", () => {
    const req = { body: { ...validBody, title: "   " } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  
  test("Error: status_id 99 → 400", () => {
    const req = { body: { ...validBody, status_id: 99 } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });



  
  // ออกแบบเองอีก 2 case
  test("Error: image '' → 400", () => {
    const req = { body: { ...validBody, image: "" } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("Error: content '' → 400", () => {
    const req = { body: { ...validBody, content: "" } };
    const res = makeRes();
    const next = vi.fn();

    postValidation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});