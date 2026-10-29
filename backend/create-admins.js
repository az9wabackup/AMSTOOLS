const bcrypt = require("bcrypt");
const db = require("./db");

async function createAdmins() {
  try {
    const admins = [
      {
        fullName: "Admin 1",
        phone: "9000000001",
        mpin: "1234",
      },
      {
        fullName: "Admin 2",
        phone: "9000000002",
        mpin: "1234",
      },
      {
        fullName: "Admin 3",
        phone: "9000000003",
        mpin: "1234",
      },
    ];

    for (const admin of admins) {
      const mpinHash = await bcrypt.hash(
        admin.mpin,
        10
      );

      await db.execute(
        `INSERT INTO admins
        (full_name, phone, mpin_hash)
        VALUES (?, ?, ?)`,
        [
          admin.fullName,
          admin.phone,
          mpinHash,
        ]
      );
    }

    console.log("3 ADMIN ACCOUNTS CREATED SUCCESSFULLY");

    process.exit(0);

  } catch (error) {
    console.error("CREATE ADMINS ERROR:", error);

    process.exit(1);
  }
}

createAdmins();