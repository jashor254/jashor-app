// src/app/layout.js

import './globals.css';
import { Inter } from 'next/font/google'; // Import the reliable Google Font

// 1. Initialize the font object
const inter = Inter({ subsets: ['latin'] });

// 2. Define Metadata (Important for SEO and app identity)
// You can adjust these details to match EduNexus branding.
export const metadata = {
  title: 'EduNexus | CBC SOW Generator',
  description: 'AI-powered Scheme of Work and Lesson Plan generator for Kenyan CBC Curriculum.',
  // Optional: Add icons or other meta tags here
};

// 3. Define the Root Layout Component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply the Inter font to the entire body */}
      <body className={inter.className}>
        {/*
          This 'children' prop renders the content of all your pages (e.g., page.js, /dashboard/page.js)
        */}
        {children}
      </body>
    </html>
  );
}