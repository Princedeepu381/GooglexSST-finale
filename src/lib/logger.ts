/**
 * Google Cloud Structured Logging Utility
 *
 * Provides structured JSON logging compatible with Google Cloud Logging
 * (formerly Stackdriver). When deployed on Google Cloud Run, these logs
 * are automatically ingested by Cloud Logging and can be queried,
 * monitored, and alerted on via the Google Cloud Console.
 *
 * @see https://cloud.google.com/logging/docs/structured-logging
 * @see https://cloud.google.com/run/docs/logging
 */

export type LogSeverity = "INFO" | "WARNING" | "ERROR" | "DEBUG";

interface StructuredLog {
  severity: LogSeverity;
  message: string;
  component: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Emits a structured JSON log entry compatible with Google Cloud Logging.
 * On Cloud Run, stdout JSON logs are automatically parsed by Cloud Logging.
 *
 * @param severity - Log level (INFO, WARNING, ERROR, DEBUG)
 * @param message - Human-readable log message
 * @param component - System component name (e.g., "api/analyze", "ingestion")
 * @param metadata - Additional key-value pairs for log context
 */
export function cloudLog(
  severity: LogSeverity,
  message: string,
  component: string,
  metadata: Record<string, unknown> = {}
): void {
  const entry: StructuredLog = {
    severity,
    message,
    component,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  // Google Cloud Logging automatically parses JSON from stdout/stderr
  if (severity === "ERROR") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

/**
 * Logs an API request event with timing and input metadata.
 * Used for performance monitoring via Google Cloud Logging.
 */
export function logAnalysisRequest(inputType: string, inputSize: number): void {
  cloudLog("INFO", "Contract analysis request received", "api/analyze", {
    inputType,
    inputSizeBytes: inputSize,
  });
}

/**
 * Logs a successful analysis completion with performance metrics.
 */
export function logAnalysisComplete(
  durationMs: number,
  risksFound: number,
  overallScore: number
): void {
  cloudLog("INFO", "Contract analysis completed", "api/analyze", {
    durationMs,
    risksFound,
    overallScore,
  });
}

/**
 * Logs an analysis error with full context for debugging.
 */
export function logAnalysisError(error: string, inputType: string): void {
  cloudLog("ERROR", "Contract analysis failed", "api/analyze", {
    error,
    inputType,
  });
}
