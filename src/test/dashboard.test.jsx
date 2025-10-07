import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import Dashboard from "../components/Dashboard";

beforeEach(() => {
  // Mock window.matchMedia for Tailwind CSS and other libs that use it
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock the auth context
vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: "test-user-id",
      email: "test@example.com",
      user_metadata: { full_name: "Test User" },
      created_at: "2023-01-01T00:00:00Z",
    },
  })),
}));

// Mock the quiz service
vi.mock("../services/quizService", () => ({
  quizService: {
    getQuizHistory: vi.fn().mockResolvedValue({ data: [], error: null }),
    getQuizStats: vi.fn().mockResolvedValue({
      data: {
        totalQuizzes: 10,
        averageScore: 85,
        totalQuestions: 100,
        totalCorrect: 85,
        categoryStats: { History: { averageScore: 80, count: 5 } },
        difficultyStats: { Easy: { averageScore: 90, count: 3 } },
      },
      error: null,
    }),
  },
}));

// Mock child components
vi.mock("../components/WeaknessAnalysis", () => ({
  default: () => <div data-testid="weakness-analysis">Weakness Analysis</div>,
}));

vi.mock("../components/PerformanceCharts", () => ({
  default: () => <div data-testid="performance-charts">Performance Charts</div>,
}));

describe("Dashboard Component", () => {
  it("renders loading state initially", () => {
    render(<Dashboard onClose={() => {}} />);
    expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
  });

  it("renders dashboard after loading", async () => {
    render(<Dashboard onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Welcome back, Test User")).toBeInTheDocument();
  });

  it("switches tabs correctly", async () => {
    render(<Dashboard onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    // Click on Performance Charts tab
    fireEvent.click(screen.getByText("📈 Performance Charts"));
    await waitFor(() => {
      expect(screen.getByTestId("performance-charts")).toBeInTheDocument();
    });

    // Click on Quiz History tab
    fireEvent.click(screen.getByText("📝 Quiz History"));
    await waitFor(() => {
      expect(screen.getByText("Recent Quiz Results")).toBeInTheDocument();
    });

    // Click on Statistics tab
    fireEvent.click(screen.getByText("📊 Statistics"));
    await waitFor(() => {
      expect(screen.getByText("Your Statistics")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", async () => {
    const mockOnClose = vi.fn();
    render(<Dashboard onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    // Find the close button by its SVG icon (X symbol)
    const closeButton = screen.getAllByRole("button")[0]; // The close button is the first button
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
