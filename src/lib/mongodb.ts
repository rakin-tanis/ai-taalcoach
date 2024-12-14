import { Role, User } from "@/types";
import { MongoClient, MongoClientOptions, ObjectId } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
export const DB_NAME = process.env.DATABASE_NAME;
export const USERS_COLLECTION = "users";
export const ROLES_COLLECTION = "roles";
export const PERMISSIONS_COLLECTION = "permissions";

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export const findUserWith = async (filter: Record<string, string>) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db(DB_NAME).collection(USERS_COLLECTION);
    const user = await usersCollection.findOne(filter);
    return user;
  } catch (error) {
    console.error("Find user error: ", error);
    throw new Error("Find user error: " + error);
  }
};

export const updateLastLogin = async (userId: string) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db(DB_NAME).collection(USERS_COLLECTION);
    const lastLoginAt = new Date();
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastLoginAt } }
    );
  } catch (error) {
    console.error("Update last login error: ", error);
    throw new Error("Update last login error: " + error);
  }
};

const roleCache = new Map<string, Role>();

export const fetchFullUserRole = async (roleNames: string[]) => {
  try {
    const fullRoles: Role[] = [];

    for (const roleName of roleNames) {
      // Check cache first
      if (roleCache.has(roleName?.trim())) {
        fullRoles.push(roleCache.get(roleName?.trim())!);
        continue;
      }

      const client = await clientPromise;
      const rolesCollection = client.db(DB_NAME).collection(ROLES_COLLECTION);

      const role = await rolesCollection.findOne({ name: roleName?.trim() });

      if (role) {
        const fullRole: Role = role as unknown as Role;

        // Cache the role
        roleCache.set(roleName?.trim(), fullRole);
        fullRoles.push(fullRole);
      }
    }

    return fullRoles;
  } catch (error) {
    console.error("Full user role fetching error: ", error);
    throw new Error("Full user role fetching error: " + error);
  }
};

export const initializeUser = async ({
  name,
  email,
  image,
  isEmailVerified,
  roles,
  provider,
}: {
  name: string;
  email: string;
  image: string;
  isEmailVerified: boolean;
  roles: string[];
  provider: string;
}) => {
  try {
    let user = await findUserWith({ email, provider });

    const client = await clientPromise;
    const usersCollection = client.db(DB_NAME).collection(USERS_COLLECTION);

    if (!user) {
      const newUser = {
        name: name,
        email: email,
        image: image,
        roles: roles, // Default roles
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        provider: "google",
        isEmailVerified: isEmailVerified || false,
        status: "ACTIVE",
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      await updateLastLogin(user._id.toHexString());
    }

    return user as unknown as User;
  } catch (error) {
    console.error("Initial user insert error: ", error);
    throw new Error("Initial user insert error: " + error);
  }
};
