import "@mantine/core/styles.css";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
export const metadata = {
  title: "Trackio",
  description: "App to track your tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mantine-color-scheme="light">
      <body>
        <MantineProvider
          theme={{
            fontFamily: '"Comic Sans MS", cursive, sans-serif',
          }}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
