/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require("dotenv");
dotenv.config();

import clientPromise, {
  DB_NAME,
  ROLES_COLLECTION,
  USERS_COLLECTION,
  PERMISSIONS_COLLECTION,
} from "./lib/mongodb";
import bcrypt from "bcryptjs";

async function initDatabase() {
  try {
    console.log("Database initializing...");
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Check for default permissions
    console.log("Permissions being checked...");
    const permissionsCollection = db.collection(PERMISSIONS_COLLECTION);
    const perms = [
      { action: "view", resource: "user" },
      { action: "create", resource: "user" },
      { action: "update", resource: "user" },
      { action: "delete", resource: "user" },
      { action: "view", resource: "adminPage" },
      { action: "view", resource: "rolesPage" },
    ];
    for (const permission of perms) {
      const existingPermission = await permissionsCollection.findOne({
        action: permission.action,
        resource: permission.resource,
      });
      if (!existingPermission) {
        await permissionsCollection.insertOne(permission);
        console.log(`Inserted permission: ${JSON.stringify(permission)}`);
      }
    }

    const permissions = await permissionsCollection.find({}).toArray();;

    // Check for ADMIN role
    console.log("Roles being checked...");
    const rolesCollection = db.collection(ROLES_COLLECTION);
    const isAdminRoleExists = await rolesCollection.findOne({ name: "ADMIN" });
    if (!isAdminRoleExists) {
      await rolesCollection.insertOne({ name: "ADMIN", permissions });
      console.log(`Inserted role: "ADMIN"`);
    }

    // Check for USER role
    const isUserRoleExists = await rolesCollection.findOne({ name: "USER" });
    if (!isUserRoleExists) {
      await rolesCollection.insertOne({
        name: "USER",
        permissions: [
          {
            ...permissions.find(
              (perm) => perm.action === "view" && perm.resource === "user"
            ),
            conditions: [
              { attribute: "userId", value: "user._id", operator: "eq" },
            ],
          },
        ],
      });
      console.log(`Inserted role: "USER"`);
    }

    // Check for default users
    console.log("Users being checked...");
    const usersCollection = db.collection(USERS_COLLECTION);
    const email = process.env.DEFAULT_ADMIN_EMAIL;
    const password = generateRandomPassword();
    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      await usersCollection.insertOne({
        name: "Admin",
        email,
        password: hashedPassword,
        roles: ["ADMIN"],
        createdAt: new Date(),
        status: "ACTIVE",
        emailVerified: false,
        provider: "credentials",
      });
      console.log(`Inserted user: ${email} with password: ${password}`);
    }
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    const client = await clientPromise;
    await client.close();
    console.log("finished.");
  }
}

function generateRandomPassword(length = 12) {
  // Define character sets
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialCharacters = "@$!%*?&_-";

  // Ensure the password meets the criteria
  const allCharacters = lowercase + uppercase + numbers + specialCharacters;

  // Generate at least one character from each required set
  const passwordArray = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)],
  ];

  // Fill the rest of the password length with random characters from all sets
  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(
      allCharacters[Math.floor(Math.random() * allCharacters.length)]
    );
  }

  // Shuffle the password array to ensure randomness
  const shuffledPassword = passwordArray
    .sort(() => Math.random() - 0.5)
    .join("");

  return shuffledPassword;
}

initDatabase();
