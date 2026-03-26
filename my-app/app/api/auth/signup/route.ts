import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

function calculateStudentMetrics(marks: {
  maths: number;
  dataScience: number;
  dbms: number;
  computer: number;
}) {
  const total = marks.maths + marks.dataScience + marks.dbms + marks.computer;
  const percentage = parseFloat(((total / 400) * 100).toFixed(2));

  let grade = 'F';
  if (percentage >= 75) {
    grade = 'A';
  } else if (percentage >= 60) {
    grade = 'B';
  } else if (percentage >= 40) {
    grade = 'C';
  }

  return { total, percentage, grade };
}

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
    const normalizedMarks = {
      maths: Number(marks?.maths ?? 0),
      dataScience: Number(marks?.dataScience ?? 0),
      dbms: Number(marks?.dbms ?? 0),
      computer: Number(marks?.computer ?? 0),
    };
    const { total, percentage, grade } = calculateStudentMetrics(normalizedMarks);

    // Create student
    const student = await Student.create({
      studentId: studentId.toUpperCase(),
      name,
      password: hashedPassword,
      marks: normalizedMarks,
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

    if (errorMessage.toLowerCase().includes('authentication failed') || errorMessage.includes('bad auth')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Check MongoDB username and password.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
