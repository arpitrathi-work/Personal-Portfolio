// Copies the browser builds of GSAP and Lenis from node_modules into assets/vendor/
// so the site keeps working on GitHub Pages without a build step.
// Usage: npm install && npm run vendor
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const files = [
  ["node_modules/gsap/dist/gsap.min.js", "gsap.min.js"],
  ["node_modules/gsap/dist/ScrollTrigger.min.js", "ScrollTrigger.min.js"],
  ["node_modules/lenis/dist/lenis.min.js", "lenis.min.js"],
  ["node_modules/lenis/dist/lenis.css", "lenis.css"],
  ["node_modules/lenis/LICENSE", "LICENSE-lenis.txt"],
];

mkdirSync("assets/vendor", { recursive: true });
for (const [from, to] of files) {
  // Drop source-map comments: the .map files are not published, so browsers would 404 on them.
  const text = readFileSync(from, "utf8").replace(/\n?\/\/# sourceMappingURL=.*$/m, "\n");
  writeFileSync(`assets/vendor/${to}`, text);
  console.log(`assets/vendor/${to}`);
}
