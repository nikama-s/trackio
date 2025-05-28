import "@testing-library/jest-dom";

declare global {
  namespace jest {
    interface Mock<T = unknown, Y extends unknown[] = unknown[]> {
      mockResolvedValue: (value: T) => Mock<T, Y>;
      mockRejectedValue: (value: unknown) => Mock<T, Y>;
      mockReturnValue: (value: T) => Mock<T, Y>;
    }
  }
}
