import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

interface whereClause {
  name?: { contains: string; mode: "insensitive" };
  email?: { contains: string; mode: "insensitive" };
  id?: number;
}

interface SearchRequestBody {
  searchItem: string;
  SearchColumn: "name" | "email" | "id"; // Restricting to known column values
}

export async function POST(request: NextRequest) {
  try {
    // console.log("Request is at search item function");

    const columnAttributes = await prisma.user.findFirst();
    if (!columnAttributes) {
      return NextResponse.json(
        {
          message: "No data found",
          success: false,
        },
        { status: 404 }
      );
    }
    const attributes = Object.keys(columnAttributes);

    // console.log("All columns in a table-", columnAttributes);
    const { searchItem, SearchColumn }: SearchRequestBody =
      await request.json();

    const whereClause: whereClause = {};
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
      const searchId = parseInt(searchItem, 10);
      if (!isNaN(searchId)) {
        whereClause.id = searchId;
      } else {
        return NextResponse.json(
          {
            message: "Invalid ID format",
            success: false,
          },
          { status: 400 }
        );
      }
    }
    const userDataAfterSearch = await prisma.user.findMany({
      where: whereClause,
    });

    return NextResponse.json(
      {
        message: "Data found successfully",
        data: userDataAfterSearch,
        columnAttributes: attributes,
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
