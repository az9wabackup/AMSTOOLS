const db = require("./db");

async function test() {
  try {
    const [rows] = await db.query("SELECT 1 AS result");
    console.log("MYSQL CONNECTED:", rows);
    process.exit(0);
  } catch (error) {
    console.error("MYSQL ERROR:", error);
    process.exit(1);
  }
}

test();