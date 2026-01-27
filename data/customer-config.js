// Customer-specific configuration
// Duplicate this file and modify for each customer

const customerConfig = {
  // Customer branding
  customerName: "Demo",
  customerLogo: null, // URL to customer logo, or null for no logo

  // Portal password (simple shared password)
  password: "demo2026",

  // External links
  ndaLink: "https://powerforms.docusign.net/0758efed-0a42-4275-b5d9-f26875d64ae6?env=na4&acct=9287b4d2-50a6-4309-b7e8-7f0b785470c0&accountId=9287b4d2-50a6-4309-b7e8-7f0b785470c0",
  intakeFormLink: "https://forms.fillout.com/t/nqEbrHoL5Eus",

  // Embedded content
  youtubeVideoId: "YOUR_YOUTUBE_VIDEO_ID", // Main overview video
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
  assignedTeam: ["izzy", "brian", "john", "david"],
};

export default customerConfig;
