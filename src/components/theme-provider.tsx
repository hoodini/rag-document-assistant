"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  attribute = "data-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous attribute value
    root.removeAttribute(attribute);

    // Handle system preference
    let systemTheme: Theme = "light";
    if (enableSystem) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      systemTheme = prefersDark ? "dark" : "light";
    }

    // Set the attribute based on the resolved theme
    const resolvedTheme = theme === "system" ? systemTheme : theme;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.setAttribute(attribute, resolvedTheme);

    // Handle transition disabling
    if (disableTransitionOnChange) {
      document.documentElement.classList.add("disable-transition");
      window.setTimeout(() => {
        document.documentElement.classList.remove("disable-transition");
      }, 0);
    }
  }, [theme, attribute, enableSystem, disableTransitionOnChange]);

  // Handle system preference change
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        setTheme("system"); // This will trigger the effect above
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, enableSystem]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}; 