import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Home from "@/pages/Home";

// Mock the hooks
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: { name: "Devaney Page", id: "123" },
  })),
}));

vi.mock("wouter", () => ({
  useLocation: vi.fn(() => ["/", vi.fn()]),
}));

describe("Home Page Branding", () => {
  afterEach(() => {
    cleanup();
  });

  it("should display the Devanomy primary logo", () => {
    render(<Home />);
    const logo = screen.getByAltText("Devanomy") as HTMLImageElement;
    expect(logo).toBeDefined();
    expect(logo.src).toContain("primary-logo-full_013d703c.png");
  });

  it("should have the correct logo dimensions", () => {
    render(<Home />);
    const logo = screen.getByAltText("Devanomy");
    expect(logo.className).toContain("h-16");
    expect(logo.className).toContain("w-auto");
  });

  it("should display the workspace greeting with the user's name", () => {
    render(<Home />);
    const greeting = screen.getByText(/Good morning, Devaney/);
    expect(greeting).toBeDefined();
  });

  it("should display the workspace description", () => {
    render(<Home />);
    const description = screen.getByText(/A light, editorial workspace/);
    expect(description).toBeDefined();
  });

  it("should display the main workspace card with warm background", () => {
    const { container } = render(<Home />);
    const mainCard = container.querySelector(".dev-soft-card");
    expect(mainCard).toBeDefined();
    expect(mainCard?.getAttribute("style")).toContain("#F5F3F0");
  });

  it("should display the upcoming tasks sidebar with warm background", () => {
    const { container } = render(<Home />);
    const aside = container.querySelector("aside.dev-card");
    expect(aside).toBeDefined();
    expect(aside?.getAttribute("style")).toContain("#F5F3F0");
  });

  it("should display stat cards with warm background", () => {
    const { container } = render(<Home />);
    const statCards = container.querySelectorAll(".dev-stat-card");
    expect(statCards.length).toBeGreaterThan(0);
    statCards.forEach((card) => {
      expect(card.getAttribute("style")).toContain("#F5F3F0");
    });
  });

  it("should display task items with warm background", () => {
    const { container } = render(<Home />);
    const taskItems = container.querySelectorAll(
      ".rounded-2xl.border.border-black\\/10"
    );
    expect(taskItems.length).toBeGreaterThan(0);
    taskItems.forEach((item) => {
      expect(item.getAttribute("style")).toContain("#F5F3F0");
    });
  });

  it("should display Quick Capture button", () => {
    render(<Home />);
    const quickCaptureBtn = screen.getByText(/Quick capture/);
    expect(quickCaptureBtn).toBeDefined();
  });

  it("should display Unified Search button", () => {
    render(<Home />);
    const searchBtn = screen.getByText(/Unified search/);
    expect(searchBtn).toBeDefined();
  });

  it("should display all three module cards", () => {
    render(<Home />);
    expect(screen.getByText("Commonplace Notebook")).toBeDefined();
    expect(screen.getByText("Clavis Aurea")).toBeDefined();
    expect(screen.getByText("Research & Writing Studio")).toBeDefined();
  });

  it("should display upcoming tasks with correct labels", () => {
    render(<Home />);
    expect(screen.getByText("Review imported quotations")).toBeDefined();
    expect(screen.getByText("Refine lexicon cross-links")).toBeDefined();
    expect(screen.getByText("Draft essay outline")).toBeDefined();
  });

  it("should display statistics with correct labels", () => {
    render(<Home />);
    expect(screen.getByText("Active Projects")).toBeDefined();
    expect(screen.getByText("Notes Captured")).toBeDefined();
    expect(screen.getByText("Terms Tracked")).toBeDefined();
    expect(screen.getByText("Knowledge Links")).toBeDefined();
  });
});
