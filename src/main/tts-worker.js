const { disposeTTS, synthesizeText } = require("./tts-service");

async function readStdin() {
  return new Promise((resolve, reject) => {
    let input = "";

    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => resolve(input));
    process.stdin.on("error", reject);
  });
}

async function main() {
  try {
    const raw = await readStdin();
    const payload = raw ? JSON.parse(raw) : {};
    const result = await synthesizeText(payload.text, payload.options || {});
    process.stdout.write(JSON.stringify(result));
  } finally {
    disposeTTS();
  }
}

main().catch((error) => {
  const message = error && error.stack ? error.stack : String(error);
  process.stderr.write(message);
  process.exit(1);
});
