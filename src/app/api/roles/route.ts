// pages/api/roles.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise, { DB_NAME, ROLES_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(ROLES_COLLECTION);

    // Fetch all roles from the collection
    const roles = await collection.find({}).toArray();

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(ROLES_COLLECTION);

    // Get the role data from the request body
    const roleData = await req.json();

    // Insert the new role into the collection
    const result = await collection.insertOne(roleData);

    return NextResponse.json(
      { message: "Role created successfully", roleId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(ROLES_COLLECTION);

    // Get the role data from the request body
    const { _id, ...updateData } = await req.json();
    console.log(_id);
    if (!_id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    // Update the role in the collection
    await collection.updateOne(
      { _id: new ObjectId(_id as string) },
      { $set: updateData }
    );

    return NextResponse.json(
      { message: "Role updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId");
    console.log(roleId);
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(ROLES_COLLECTION);

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    // Delete the role from the collection
    await collection.deleteOne({ _id: new ObjectId(roleId) });

    return NextResponse.json(
      { message: "Role deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
