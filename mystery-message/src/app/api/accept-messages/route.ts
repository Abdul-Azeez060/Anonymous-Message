import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import { use } from "react";

export async function POST(request: NextRequest) {
  const { isAcceptingMessages } = await request.json();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        messsage: "User not logged in",
      },
      {
        status: 405,
      }
    );
  }

  const user: User = session.user;
  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isAcceptingMessages,
      },
    });
    return NextResponse.json(
      {
        success: true,
        messsage: "Changed the accepting messages successfull",
      },
      {
        status: 405,
      }
    );
  } catch (error) {
    console.error("Error in changing the accepting messages");
    return NextResponse.json(
      {
        success: false,
        messsage: "Error in changing the accepting messages",
      },
      {
        status: 405,
      }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        messsage: "User not logged in",
      },
      {
        status: 410,
      }
    );
  }

  const user: User = session.user;
  try {
    const obtainedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        isAcceptingMessages: true,
      },
    });
    if (!obtainedUser) {
      return NextResponse.json(
        {
          success: false,
          messsage: "User not found",
        },
        {
          status: 405,
        }
      );
    }
    return NextResponse.json(
      {
        success: true,
        isAcceptingMessages: obtainedUser.isAcceptingMessages,
      },
      {
        status: 205,
      }
    );
  } catch (error) {
    console.error("Error in obtaining the accepting messages");
    return NextResponse.json(
      {
        success: false,
        messsage: "Error in obtaining the accepting messages",
      },
      {
        status: 405,
      }
    );
  }
}
