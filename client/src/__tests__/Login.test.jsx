import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../App";
import Login from "../pages/Login";

const mockAuth = { user: null, setUser: vi.fn(), logout: vi.fn(), loading: false };

const renderLogin = () =>
  render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("Login", () => {
  test("renders email and password inputs", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("shows validation error for invalid email on submit", () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "notanemail" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  test("shows error when password field is empty on submit", () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});