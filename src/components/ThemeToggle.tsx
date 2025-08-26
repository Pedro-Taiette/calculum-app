import React from "react";
export function ThemeToggle() {
  const [dark, setDark] = React.useState(
    () => document.documentElement.classList.contains("dark")
  );
  function toggle() {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }
  return <button onClick={toggle} className="btn btn-ghost">{dark ? "Dark" : "Light"}</button>;
}