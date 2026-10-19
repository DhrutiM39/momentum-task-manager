const request = require("supertest");
const app = require("../app");

describe("Task Manager API", () => {
  test("GET / reports that the API is running", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Task Manager API is running",
      docs: "/api/tasks"
    });
  });

  test("GET /api/auth/me rejects unauthenticated requests", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toMatch(/authentication required/i);
  });
});
