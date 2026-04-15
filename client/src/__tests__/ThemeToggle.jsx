import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "../components/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  test("renders a toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /toggle dark mode/i })).toBeInTheDocument();
  });

  test("clicking the button changes the data-theme attribute", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    const before = document.documentElement.getAttribute("data-theme");
    fireEvent.click(btn);
    const after = document.documentElement.getAttribute("data-theme");
    expect(after).not.toBe(before);
  });

  test("persists the selected theme to localStorage", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    const stored = localStorage.getItem("theme");
    expect(["light", "dark"]).toContain(stored);
  });
});