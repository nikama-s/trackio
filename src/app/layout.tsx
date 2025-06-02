import "@mantine/core/styles.css";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import { Providers } from "@/Providers";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

export const metadata = {
  title: "Trackio",
  description: "App to track your tasks"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mantine-color-scheme="light">
      <body>
        <Providers>
          <MantineProvider
            theme={{
              fontFamily: '"Comic Sans MS", cursive, sans-serif'
            }}
          >
            <Notifications />
            {children}
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
