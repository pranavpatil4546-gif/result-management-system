import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

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

    // Validate marks
    const { maths, dataScience, dbms, computer } = marks;
    if (
      [maths, dataScience, dbms, computer].some(
        (m: number) => m < 0 || m > 100
      )
    ) {
      return NextResponse.json(
        { error: 'Marks must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if student exists
    const existingStudent = await Student.findOne({ studentId: studentId.toUpperCase() });

    if (existingStudent) {
      // Update existing student
      existingStudent.name = name;
      existingStudent.password = hashedPassword;
      existingStudent.marks = marks;
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
        marks,
      });

      return NextResponse.json({
        success: true,
        message: 'Student added successfully',
        student,
      });
    }
  } catch (error) {
    console.error('Error saving student:', error);
    return NextResponse.json(
      { error: 'Failed to save student' },
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
