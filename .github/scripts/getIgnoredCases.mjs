import { GITHUB_EVENT_PATH } from "./_config.mjs";
import { parseComment } from "./_helpers.mjs";
import fs from "fs";

(async function main() {
  try {
    const { excludeIds } = await parseComment(GITHUB_EVENT_PATH);

    if (!excludeIds?.length) {
      fs.writeFileSync("ignored.md", "## 🧩 Ignored Test Cases Ids\nnone\n");
      return;
    }

    const markdown = [
      "## 🧩 Ignored Test Cases Ids",
      ...excludeIds.map(id => `- ${id}`),
      "",
    ].join("\n");

    fs.writeFileSync("ignored.md", markdown);
  } catch (err) {
    console.error("❌ Error writing ignored.md:", err);
    process.exit(1);
  }
})();
