import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, PERMISSIONS_COLLECTION } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(PERMISSIONS_COLLECTION);

    // Fetch all roles from the collection
    const permissions = await collection.find({}).toArray();

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
