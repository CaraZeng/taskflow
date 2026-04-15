import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../App";
import NewProject from "../pages/NewProject";

const mockAuth = { user: { id:1, name:"Test", role:"user" }, setUser: vi.fn(), logout: vi.fn(), loading: false };

const renderNewProject = () =>
  render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter>
        <NewProject />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("NewProject", () => {
  test("renders the project name input", () => {
    renderNewProject();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
  });

  test("shows error when title is too short", () => {
    renderNewProject();
    fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: "a" } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));
    expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  test("shows cancel button that navigates back", () => {
    renderNewProject();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
});