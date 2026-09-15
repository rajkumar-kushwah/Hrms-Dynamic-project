import { createContext, useContext, useState, useEffect, } from "react";

type ThemeContextType = {
    dark: boolean;
    setDark: React.Dispatch<React.SetStateAction<boolean>>;
    toggleTheme: (e: React.MouseEvent<HTMLElement>) => void;
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

    const toggleTheme = (e: React.MouseEvent<HTMLElement>) => {
        const x = e.clientX;
        const y = e.clientY;

        const circle = document.createElement("div");

        circle.style.position = "fixed";
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.style.width = "20px";
        circle.style.height = "20px";
        circle.style.borderRadius = "9999px";
        circle.style.background = dark ? "#fff" : "#000";
        circle.style.border = dark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(0,0,0,0.15)";
        circle.style.opacity = "1";
        circle.style.transform = "translate(-50%, -50%) scale(0)";
        circle.style.transition =
            "transform 1200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1200ms ease";
        circle.style.zIndex = "9999";
        circle.style.pointerEvents = "none";

        document.body.appendChild(circle);

        requestAnimationFrame(() => {
            circle.style.transform = "translate(-50%, -50%) scale(90)";
            circle.style.opacity = "0";
        });

        setTimeout(() => {
            setDark((prev) => !prev);
        }, 350);

        setTimeout(() => {
            circle.remove();
        }, 1200);
    };

    return (
        <ThemeContext.Provider value={{ dark, setDark, toggleTheme }}>
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


