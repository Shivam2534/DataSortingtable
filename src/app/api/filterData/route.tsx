import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { filterOption, order } = await request.json();
    let orderedByClause = {};

    if (filterOption == "name") {
      orderedByClause = { name: order };
    } else if (filterOption == "email") {
      orderedByClause = { email: order };
    } else orderedByClause = { id: order };

    const OrderedUsers = await prisma.user.findMany({
      orderBy: orderedByClause,
    });

    const columnAttributes = Object.keys(OrderedUsers[0]);

    return NextResponse.json(
      {
        message: "Data found successfully",
        OrderedUsers: OrderedUsers,
        columnAttributes: columnAttributes,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Filter not applyed (something went wrong)",
        error: error,
        success: false,
      },
      { status: 500 }
    );
  }
}
