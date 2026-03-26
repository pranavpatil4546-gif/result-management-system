import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { studentId, name, password, marks } = body;

    // Validation
    if (!studentId || !name || !password) {
      return NextResponse.json(
        { error: 'Student ID, name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      studentId: studentId.toUpperCase() 
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student ID already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate total and percentage
    const maths = marks?.maths || 0;
    const dataScience = marks?.dataScience || 0;
    const dbms = marks?.dbms || 0;
    const computer = marks?.computer || 0;

    const total = maths + dataScience + dbms + computer;
    const percentage = total / 4;

    // Determine grade
    let grade = 'F';
    if (percentage >= 75) {
      grade = 'A';
    } else if (percentage >= 60) {
      grade = 'B';
    } else if (percentage >= 40) {
      grade = 'C';
    }

    // Create student
    const student = await Student.create({
      studentId: studentId.toUpperCase(),
      name,
      password: hashedPassword,
      marks: {
        maths,
        dataScience,
        dbms,
        computer,
      },
      total,
      percentage,
      grade,
      rank: 0, // Will be updated when fetching results
    });

    return NextResponse.json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: student.studentId,
        name: student.name,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Signup error:', errorMessage, error);

    // Check for specific MongoDB errors
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('network')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your network.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('MONGODB_URI')) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
