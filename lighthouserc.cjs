module.exports = {
  ci: {
    collect: {
      // Astro 静的ビルドを preview で配信
      startServerCommand: "npm run preview -- --host 127.0.0.1 --port 4321",
      startServerReadyPattern: "Local|localhost|started|ready",
      url: ["http://127.0.0.1:4321/"],
      numberOfRuns: 1,
      settings: { preset: "desktop", chromeFlags: "--headless=new --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        interactive: "off",
      },
    },
    upload: { target: "filesystem", outputDir: "./.lighthouseci" },
  },
};
