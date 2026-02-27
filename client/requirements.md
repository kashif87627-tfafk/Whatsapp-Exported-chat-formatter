## Packages
react-dropzone | File upload drag and drop handling
framer-motion | Page transitions and animations
date-fns | Date formatting utilities

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}

The backend schema expects `rawText` in the POST request to `/api/chats`. We will read the `.txt` file contents into a string on the client and pass it as `rawText` so the backend can parse it.
