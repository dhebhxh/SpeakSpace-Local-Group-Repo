const fs = require("fs/promises");
const { getManagedCleanupTargets, getManagedDataRoot } = require("../src/main/managed-paths");

async function main() {
  const cleanupTargets = getManagedCleanupTargets();
  console.log(`Cleaning managed assets under ${getManagedDataRoot()}`);

  for (const targetPath of cleanupTargets) {
    await fs.rm(targetPath, { recursive: true, force: true });
    console.log(`Removed: ${targetPath}`);
  }

  console.log("Local asset cleanup finished.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
