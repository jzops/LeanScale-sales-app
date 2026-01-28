// Customer-specific configuration
// Duplicate this file and modify for each customer instance

const customerConfig = {
  // ============================================
  // CUSTOMER BRANDING
  // ============================================
  // Set customerName to show "LeanScale × CustomerName" in the navigation
  // Set to "Demo" or empty string to show only the LeanScale logo
  customerName: "Clay",
  
  // Optional: URL to customer logo image (PNG, SVG, or JPG)
  // If provided, displays logo instead of text name
  // Example: "/customer-logo.png" (place file in /public folder)
  // Example: "https://example.com/logo.png" (external URL)
  customerLogo: "/customer-logo-example.svg",

  // Portal password (simple shared password)
  password: "demo2026",

  // External links
  ndaLink: "https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0",
  intakeFormLink: "https://forms.fillout.com/t/nqEbrHoL5Eus",

  // Embedded content
  youtubeVideoId: "M7oECb8xsy0", // Main overview video
  googleSlidesEmbedUrl: "https://docs.google.com/presentation/d/e/2PACX-1vSGSLvHvPn9Cus6N3BpGnK6AkZsUiEdh8cARVVBiZ4w54uUCjHHJ-lHfymW8wfPPraAXMfgXtePxIwf/pubembed?start=true&loop=true&delayms=3000",
  clayVideoWistiaId: "YOUR_WISTIA_VIDEO_ID",

  // Available start dates (managed by LeanScale)
  startDates: [
    { date: "2026-02-02", status: "waitlist" },
    { date: "2026-02-16", status: "waitlist" },
    { date: "2026-03-02", status: "available", spotsLeft: 2 },
    { date: "2026-03-16", status: "available", spotsLeft: 3 },
  ],

  // Team members assigned to this customer (by ID)
  // Options: izzy, brian, john, derek (Architects)
  //          dave, kavean, eduardo, raph, rodolfo, solange, christopher, diego (Engineers)
  assignedTeam: ["izzy", "brian", "dave", "kavean"],
};

export default customerConfig;
