
const request = require("supertest");
const app = require("./server");

describe("Momentum Task Manager API", () => {
  test("GET / should return 200 and API running message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Task Manager API is running");
    expect(response.body.docs).toBe("/api/tasks");
  });

  test("GET /unknown-route should return 404", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
