import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME, USERS_COLLECTION } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const userId = (await params).userId;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(USERS_COLLECTION);

  try {
    const user = await collection.findOne({
      _id: new ObjectId(`${userId}`),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;
  const body = await req.json();

  if (!userId) {
    return NextResponse.json(
      { error: "User  ID is required" },
      { status: 400 }
    );
  }

  if (!body) {
    return NextResponse.json(
      { error: "Request body is required" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(USERS_COLLECTION);

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: body }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "User  not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User  updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
