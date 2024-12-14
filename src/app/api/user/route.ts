import { NextRequest, NextResponse } from "next/server";
import clientPromise, { DB_NAME, USERS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(USERS_COLLECTION);

    // Build search query
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await collection.countDocuments(query);
    // Get paginated results
    const users = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(USERS_COLLECTION);

  try {
    await collection.deleteOne({ _id: new ObjectId(userId) });
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
