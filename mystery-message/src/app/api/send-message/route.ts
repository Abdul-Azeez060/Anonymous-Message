import prisma from "@/lib/db";
import { messageSchmea } from "@/Schema";
import { NextRequest, NextResponse } from "next/server";

async function GET(request: NextRequest) {
  try {
    const { username, content } = await request.json();
    const result = messageSchmea.safeParse({ content });
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: "Content should be minimum 10 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
        isVerified: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        {
          status: 404,
        }
      );
    }
    // is user accepting the messages
    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        {
          success: false,
          message: "User not accepting messages",
        },
        {
          status: 402,
        }
      );
    }
    const newMessage = { content, userId: user.id };

    await prisma.message.create({
      data: newMessage,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error in sending the message",
    });
  }
}
