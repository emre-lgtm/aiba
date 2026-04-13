const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Building...");
execSync("npm run build", { stdio: "inherit" });

const standaloneDir = path.join(__dirname, ".next", "standalone");
const staticDir = path.join(__dirname, ".next", "static");
const publicDir = path.join(__dirname, "public");

const targetStatic = path.join(standaloneDir, ".next", "static");
const targetPublic = path.join(standaloneDir, "public");

fs.cpSync(staticDir, targetStatic, { recursive: true });
fs.cpSync(publicDir, targetPublic, { recursive: true });

console.log("Standalone build ready at .next/standalone/");
console.log("Entry: node .next/standalone/server.js");
