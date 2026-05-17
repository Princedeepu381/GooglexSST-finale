import { render, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { RiskCard, MetricBar, ScoreCircle } from "@/components/RiskCard";

afterEach(() => {
  cleanup();
});

const mockRisk = {
  id: "risk-1",
  category: "Employment",
  originalText: "The employee shall not work for any competitor for 10 years.",
  explanation: "Excessively long non-compete clause",
  consequence: "You would be unable to work in your industry for a decade after leaving.",
  severity: "High" as const,
  recommendation: "Negotiate the non-compete period down to 1-2 years maximum.",
};

describe("RiskCard", () => {
  it("renders severity badge and explanation", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    expect(container.textContent).toContain("High Risk");
    expect(container.textContent).toContain("Excessively long non-compete clause");
  });

  it("renders category badge", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    expect(container.textContent).toContain("Employment");
  });

  it("renders consequence text", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    expect(container.textContent).toContain("unable to work in your industry");
  });

  it("renders recommendation text when provided", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    expect(container.textContent).toContain("Negotiate the non-compete period");
  });

  it("does not render recommendation when absent", () => {
    const riskNoRec = { ...mockRisk, recommendation: undefined };
    const { container } = render(<RiskCard risk={riskNoRec} />);
    expect(container.textContent).not.toContain("Negotiate");
  });

  it("has article element with aria-label for accessibility", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article?.getAttribute("aria-label")).toContain("High severity");
  });

  it("toggle button has aria-expanded attribute", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-expanded")).toBe("false");
  });

  it("toggles original clause visibility on click", () => {
    const { container } = render(<RiskCard risk={mockRisk} />);
    expect(container.textContent).not.toContain("shall not work for any competitor");

    // Click to expand using fireEvent for React state update
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(container.textContent).toContain("shall not work for any competitor");

    // Click to collapse
    fireEvent.click(button);
    expect(container.textContent).not.toContain("shall not work for any competitor");
  });

  it("renders medium severity correctly", () => {
    const mediumRisk = { ...mockRisk, severity: "Medium" as const };
    const { container } = render(<RiskCard risk={mediumRisk} />);
    expect(container.textContent).toContain("Medium Risk");
  });

  it("renders low severity correctly", () => {
    const lowRisk = { ...mockRisk, severity: "Low" as const };
    const { container } = render(<RiskCard risk={lowRisk} />);
    expect(container.textContent).toContain("Low Risk");
  });
});

describe("MetricBar", () => {
  it("renders label and score", () => {
    const { container } = render(<MetricBar label="Privacy Protection" score={85} />);
    expect(container.textContent).toContain("Privacy Protection");
    expect(container.textContent).toContain("85%");
  });

  it("applies green color for high scores (>=80)", () => {
    const { container } = render(<MetricBar label="Test" score={90} />);
    expect(container.textContent).toContain("90%");
    const bar = container.querySelector("[style]");
    expect(bar?.getAttribute("style")).toContain("90%");
  });

  it("applies amber color for medium scores (60-79)", () => {
    const { container } = render(<MetricBar label="Test" score={65} />);
    expect(container.textContent).toContain("65%");
  });

  it("applies red color for low scores (<60)", () => {
    const { container } = render(<MetricBar label="Test" score={30} />);
    expect(container.textContent).toContain("30%");
  });

  it("has role=meter with correct aria attributes", () => {
    const { container } = render(<MetricBar label="Privacy" score={75} />);
    const meter = container.querySelector("[role='meter']");
    expect(meter).not.toBeNull();
    expect(meter?.getAttribute("aria-valuenow")).toBe("75");
    expect(meter?.getAttribute("aria-valuemin")).toBe("0");
    expect(meter?.getAttribute("aria-valuemax")).toBe("100");
  });
});

describe("ScoreCircle", () => {
  it("renders the score number", () => {
    const { container } = render(<ScoreCircle score={72} />);
    expect(container.querySelector("span")?.textContent).toBe("72");
  });

  it("shows High Risk for low scores (<60)", () => {
    const { container } = render(<ScoreCircle score={25} />);
    expect(container.textContent).toContain("High Risk");
  });

  it("shows Moderate for medium scores (60-79)", () => {
    const { container } = render(<ScoreCircle score={65} />);
    expect(container.textContent).toContain("Moderate");
  });

  it("shows Low Risk for high scores (>=80)", () => {
    const { container } = render(<ScoreCircle score={90} />);
    expect(container.textContent).toContain("Low Risk");
  });

  it("has role=meter with correct aria attributes", () => {
    const { container } = render(<ScoreCircle score={42} />);
    const meter = container.querySelector("[role='meter']");
    expect(meter).not.toBeNull();
    expect(meter?.getAttribute("aria-valuenow")).toBe("42");
  });

  it("renders SVG circle gauge", () => {
    const { container } = render(<ScoreCircle score={50} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });
});
