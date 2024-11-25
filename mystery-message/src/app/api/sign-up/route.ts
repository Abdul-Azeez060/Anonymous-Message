import { messageSchmea, userSignupSchema } from "@/Schema";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const success = userSignupSchema.parse(userData);
    if (!success) {
      return Response.json({
        success: false,
        message: "Enter valid username, email",
      });
    }
    const userwithUsername = await prisma.user.findUnique({
      where: {
        username: userData.username,
      },
    });
    const userWithEmail = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    const verifyCode = Math.floor(100000 * Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date();
    verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);
    if (userwithUsername) {
      if (userwithUsername.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exits with the username",
          },
          {
            status: 500,
          }
        );
      } else {
        if (userWithEmail?.isVerified) {
          return NextResponse.json({
            success: false,
            message: "User with email already exitsts, Sign in",
          });
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.update({
          where: {
            username: userData.username,
          },
          data: {
            email: userData.email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry,
          },
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      if (userWithEmail) {
        console.log("user with email exits");
        if (userWithEmail.isVerified) {
          console.log("user with email is verified");
          return NextResponse.json(
            {
              success: false,
              message: "User with email already exitsts, Sign in",
            },
            { status: 402 }
          );
        } else if (!userWithEmail.isVerified) {
          const user = await prisma.user.update({
            where: {
              email: userData.email,
            },
            data: {
              username: userData.username,
              password: hashedPassword,
              verifyCode,
              verifyCodeExpiry,
            },
          });
        }
      } else {
        console.log(
          "user with email doesn't not exits and creating a new user "
        );
        const user = await prisma.user.create({
          data: {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry,
          },
        });
      }
    }

    const emailResponse = await sendVerificationEmail(
      userData.username,
      verifyCode,
      userData.email
    );
    console.log(emailResponse);
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          messsage: emailResponse.message,
        },
        { status: 500 }
      );
    }
    return Response.json({
      success: true,
      message: "User registered successfull, verify your email",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
