const fs = require("fs");
const path = require("path");
const { getAppsDirs } = require("./utils");

for (const dir of getAppsDirs()) {
  const pkgName = path.basename(dir);
  try {
    const pathToPkg = path.join(__dirname, "..", dir, "package.json");
    const pkg = require(pathToPkg);
    if (pkg.name === pkgName) continue;
    pkg.name = pkgName;
    fs.writeFileSync(pathToPkg, `${JSON.stringify(pkg, null, 2)}\n`);
  } catch (error) {
    if (error.message?.includes("Cannot find module")) {
      continue;
    }
    throw error;
  }
}
