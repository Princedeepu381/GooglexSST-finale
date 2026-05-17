import { describe, it, expect, vi } from "vitest";
import { cloudLog, logAnalysisRequest, logAnalysisComplete, logAnalysisError } from "@/lib/logger";

describe("Google Cloud Logging - cloudLog", () => {
  it("outputs structured JSON to console.log for INFO severity", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    cloudLog("INFO", "Test message", "test-component");

    expect(spy).toHaveBeenCalledOnce();
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.severity).toBe("INFO");
    expect(logged.message).toBe("Test message");
    expect(logged.component).toBe("test-component");
    expect(logged.timestamp).toBeDefined();
    spy.mockRestore();
  });

  it("outputs to console.error for ERROR severity", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    cloudLog("ERROR", "Error occurred", "test-component");

    expect(spy).toHaveBeenCalledOnce();
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.severity).toBe("ERROR");
    spy.mockRestore();
  });

  it("includes additional metadata in log entries", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    cloudLog("INFO", "With metadata", "test", { userId: "123", action: "analyze" });

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.userId).toBe("123");
    expect(logged.action).toBe("analyze");
    spy.mockRestore();
  });
});

describe("Google Cloud Logging - Helper Functions", () => {
  it("logAnalysisRequest logs input type and size", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logAnalysisRequest("pdf", 1024);

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.inputType).toBe("pdf");
    expect(logged.inputSizeBytes).toBe(1024);
    expect(logged.component).toBe("api/analyze");
    spy.mockRestore();
  });

  it("logAnalysisComplete logs duration and results", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logAnalysisComplete(1500, 5, 42);

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.durationMs).toBe(1500);
    expect(logged.risksFound).toBe(5);
    expect(logged.overallScore).toBe(42);
    spy.mockRestore();
  });

  it("logAnalysisError logs error details to stderr", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logAnalysisError("Connection timeout", "pdf");

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.severity).toBe("ERROR");
    expect(logged.error).toBe("Connection timeout");
    expect(logged.inputType).toBe("pdf");
    spy.mockRestore();
  });
});
