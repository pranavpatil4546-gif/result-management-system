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

// GET - Fetch all students (for admin)
export async function GET() {
  try {
    await dbConnect();
    
    const students = await Student.find().sort({ total: -1 });
    
    // Calculate ranks
    const rankedStudents = students.map((student, index) => ({
      ...student.toObject(),
      rank: index + 1,
    }));

    return NextResponse.json({ students: rankedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create or update a student
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { studentId, name, password, marks } = await req.json();

    if (!studentId || !name || !password || !marks) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const normalizedMarks = {
      maths: Number(marks.maths),
      dataScience: Number(marks.dataScience),
      dbms: Number(marks.dbms),
      computer: Number(marks.computer),
    };

    const { maths, dataScience, dbms, computer } = normalizedMarks;
    if (
      [maths, dataScience, dbms, computer].some(
        (m) => Number.isNaN(m) || m < 0 || m > 100
      )
    ) {
      return NextResponse.json(
        { error: 'Marks must be between 0 and 100' },
        { status: 400 }
      );
    }

    const { total, percentage, grade } = calculateStudentMetrics(normalizedMarks);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if student exists
    const existingStudent = await Student.findOne({ studentId: studentId.toUpperCase() });

    if (existingStudent) {
      // Update existing student
      existingStudent.name = name;
      existingStudent.password = hashedPassword;
      existingStudent.marks = normalizedMarks;
      existingStudent.total = total;
      existingStudent.percentage = percentage;
      existingStudent.grade = grade;
      await existingStudent.save();

      return NextResponse.json({
        success: true,
        message: 'Student updated successfully',
        student: existingStudent,
      });
    } else {
      // Create new student
      const student = await Student.create({
        studentId: studentId.toUpperCase(),
        name,
        password: hashedPassword,
        marks: normalizedMarks,
        total,
        percentage,
        grade,
      });

      return NextResponse.json({
        success: true,
        message: 'Student added successfully',
        student,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving student:', errorMessage, error);

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

    if (errorMessage.includes('validation failed')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (errorMessage.toLowerCase().includes('authentication failed')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Check MongoDB username and password.' },
        { status: 500 }
      );
    }

    if (errorMessage.includes('bad auth')) {
      return NextResponse.json(
        { error: 'Database authentication failed. Check MongoDB username and password.' },
        { status: 500 }
      );
    }

    if (errorMessage.includes('buffering timed out')) {
      return NextResponse.json(
        { error: 'Database request timed out while connecting.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Failed to save student: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete a student
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const deleted = await Student.findOneAndDelete({ studentId: studentId.toUpperCase() });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
