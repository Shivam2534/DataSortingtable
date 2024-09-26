import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function POST(request: NextRequest) {
  try {
    console.log("Request is at search item function");

    const columnAttributes = await prisma.user.findFirst();
    columnAttributes = Object.keys(columnAttributes);

    console.log("All columns in a table-", columnAttributes);
    const { searchItem, SearchColumn } = await request.json();
    console.log(SearchColumn);

    const whereClause = {};
    if (SearchColumn === "name") {
      whereClause.name = {
        contains: searchItem,
        mode: "insensitive",
      };
    } else if (SearchColumn === "email") {
      whereClause.email = {
        contains: searchItem,
        mode: "insensitive",
      };
    } else if (SearchColumn === "id") {
      whereClause.id = {
        contains: searchItem,
        mode: "insensitive",
      };
    }
    const userDataAfterSearch = await prisma.user.findMany({
      where: whereClause,
    });

    return NextResponse.json(
      {
        message: "Data found successfully",
        data: userDataAfterSearch,
        columnAttributes: columnAttributes,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing the request",
        success: false,
      },
      { status: 500 }
    );
  }
}
