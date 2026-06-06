import { createContext, useContext, useState, useEffect, } from "react";

type ThemeContextType = {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [dark, setDark] = useState(() => {
        return localStorage.getItem("dark") === "true";
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("dark", "true");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("dark", "false");
        }
    }, [dark]);

    return (
        <ThemeContext.Provider value={{ dark, setDark }}>
            {children}
        </ThemeContext.Provider>
    )


}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider.");
    }
    return context;
}


