# Button

Buttons move the talk or act on the canvas. **Primary** (`canvas-blue`) at most once per view, usually "Start" or "Next topic". **Quiet** for secondary actions, **ghost** for "Back to overview". Verb first, sentence case. The consumer provides the label and click handler: `PadnirCanvas.Button({label, variant, onClick})`.
