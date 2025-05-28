import "@testing-library/jest-dom";

process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

jest.setTimeout(10000);

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Warning: ReactDOM.render is no longer supported")
  ) {
    return;
  }
  originalError.call(console, ...args);
};

global.NextResponse = {
  json: (body, init) => {
    return new Response(JSON.stringify(body), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init?.headers
      }
    });
  }
};

afterEach(() => {
  jest.clearAllMocks();
});
