import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("API health and validation", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("rejects invalid contact submissions before persistence", async () => {
    const response = await request(app).post("/api/v1/public/contact").send({
      name: "A",
      email: "not-an-email",
      subject: "",
      message: "short",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });
});
