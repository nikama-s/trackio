import api from "../axiosInstance";
import MockAdapter from "axios-mock-adapter";

describe("Axios Instance", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  describe("Default Configuration", () => {
    it("should have correct default configuration", () => {
      expect(api.defaults.headers["Content-Type"]).toBe("application/json");
      expect(api.defaults.timeout).toBe(60000);
      expect(api.defaults.withCredentials).toBe(true);
    });
  });

  describe("Response Interceptor", () => {
    it("should pass through successful responses", async () => {
      const testData = { message: "success" };
      mock.onGet("/test").reply(200, testData);

      const response = await api.get("/test");
      expect(response.data).toEqual(testData);
    });

    it("should handle 401 errors for non-auth endpoints", async () => {
      // Mock the refresh token endpoint
      mock.onPost("/api/auth/refresh").reply(200, { token: "new-token" });

      // Mock the original request that fails with 401
      mock.onGet("/api/protected").reply(401);

      // Mock the retry of the original request after token refresh
      mock.onGet("/api/protected").reply(200, { data: "protected-data" });

      const response = await api.get("/api/protected");
      expect(response.data).toEqual({ data: "protected-data" });
    });

    it("should not retry auth endpoints on 401", async () => {
      mock.onGet("/api/auth/check").reply(401);

      await expect(api.get("/api/auth/check")).rejects.toThrow();
    });

    it("should handle refresh token failure", async () => {
      // Mock the refresh token endpoint to fail
      mock.onPost("/api/auth/refresh").reply(401);

      // Mock the original request that fails with 401
      mock.onGet("/api/protected").reply(401);

      await expect(api.get("/api/protected")).rejects.toThrow();
    });

    it("should queue multiple requests during token refresh", async () => {
      // Mock the refresh token endpoint
      mock.onPost("/api/auth/refresh").reply(200, { token: "new-token" });

      // Mock multiple requests that fail with 401
      mock.onGet("/api/protected1").reply(401);
      mock.onGet("/api/protected2").reply(401);

      // Mock the retry of the original requests after token refresh
      mock.onGet("/api/protected1").reply(200, { data: "protected-data-1" });
      mock.onGet("/api/protected2").reply(200, { data: "protected-data-2" });

      const [response1, response2] = await Promise.all([
        api.get("/api/protected1"),
        api.get("/api/protected2")
      ]);

      expect(response1.data).toEqual({ data: "protected-data-1" });
      expect(response2.data).toEqual({ data: "protected-data-2" });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      mock.onGet("/test").networkError();

      await expect(api.get("/test")).rejects.toThrow();
    });

    it("should handle timeout errors", async () => {
      mock.onGet("/test").timeout();

      await expect(api.get("/test")).rejects.toThrow();
    });

    it("should handle server errors", async () => {
      mock.onGet("/test").reply(500, { error: "Internal Server Error" });

      await expect(api.get("/test")).rejects.toThrow();
    });
  });
});
