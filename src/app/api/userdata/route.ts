import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

// export async function POST() {
//   console.log("Request is here");

//   try {
//     const res = await prisma.user.create({
//       data: {
//         name: "nishit",
//         email: "shailesha@gmail.com",
//       },
//     });

//     return Response.json({
//       message: "User data added successfully",
//       data: res,
//       success: true,
//     });
//   } catch (error) {
//     return Response.json({
//       message: error.message,
//       success: false,
//     });
//   }
// }

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    const columnAttributes = Object.keys(users[0]);

    return NextResponse.json({
      message: "All users are fetched successfully",
      columnAttributes: columnAttributes,
      data: users,
      success: true,
      status: 200,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      message: "We are unable to fetch data",
      success: false,
      status: 500,
    });
  }
}

// export async function PUT() {
//   try {
//     const res = await prisma.user.update({
//       where: {
//         email: "shivam1@gmail.com",
//       },
//       data: {
//         email: "UpdatedEmail@gmail.com",
//       },
//     });

//     return Response.json({
//       message: "We have updated the data",
//       success: true,
//       status: 200,
//     });
//   } catch (error) {
//     console.log(error);

//     return Response.json({
//       message: "We are unable to update data",
//       success: false,
//       status: 500,
//     });
//   }
// }

// export async function DELETE() {
//   try {
//     const deleteUser = await prisma.user.delete({
//       where: {
//         email: "shivam11@gmail.com",
//       },
//     });

//     return Response.json({
//       message: "We have Deleted your data",
//       success: true,
//       status: 200,
//       data: deleteUser,
//     });
//   } catch (error) {
//     console.log(error);

//     return Response.json({
//       message: "We are unable to delete data",
//       success: false,
//       status: 500,
//     });
//   }
// }
