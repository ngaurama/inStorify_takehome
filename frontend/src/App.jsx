import { AppInner } from "./components/AppInner";
import { ThemeProvider } from "./ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
