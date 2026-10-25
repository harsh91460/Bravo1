import {
  describe,
  it,
  expect,
  vi,
  afterEach
} from "vitest";
import request from "supertest";

vi.mock("mongoose", () => ({
  default: {
    connection: {
      readyState: 1
    }
  }
}));

vi.mock("../src/config/redis.js", () => ({
  getRedisClient: vi.fn(() => ({
    isReady: true
  }))
}));

import mongoose from "mongoose";
import { getRedisClient } from "../src/config/redis.js";
import app from "../src/app.js";

afterEach(() => {
  vi.clearAllMocks();

  mongoose.connection.readyState = 1;

  getRedisClient.mockReturnValue({
    isReady: true
  });
});

describe("GET /health", () => {
  it("returns API and dependency health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "bravo-api",
      dependencies: {
        mongodb: "connected",
        redis: "connected"
      }
    });
  });

  it("returns 503 when MongoDB is disconnected", async () => {
    mongoose.connection.readyState = 0;

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("unavailable");
    expect(response.body.dependencies.mongodb).toBe(
      "disconnected"
    );
  });

  it("sets security headers", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["x-content-type-options"]).toBe(
      "nosniff"
    );

    expect(response.headers["x-frame-options"]).toBeDefined();
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("does not grant CORS access to an unknown origin", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "https://untrusted.example");

    expect(response.status).toBe(200);

    expect(
      response.headers["access-control-allow-origin"]
    ).toBeUndefined();
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get(
      "/this-route-does-not-exist"
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: "Route not found"
    });
  });

  it("rejects malformed JSON", async () => {
    const response = await request(app)
      .post("/api/test")
      .set("Content-Type", "application/json")
      .send('{"invalid":');

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Invalid JSON body"
    });
  });
});