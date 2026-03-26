import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Student from '@/models/Student';

// GET - Fetch a single student's result
export async function GET(req: NextRequest) {
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

    const student = await Student.findOne({ studentId: studentId.toUpperCase() });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get all students for leaderboard ranking
    const allStudents = await Student.find().sort({ total: -1 });
    const rank = allStudents.findIndex(s => s.studentId === student.studentId) + 1;

    return NextResponse.json({
      student: {
        ...student.toObject(),
        rank,
      },
      leaderboard: allStudents.map((s, index) => ({
        ...s.toObject(),
        rank: index + 1,
      })),
    });
  } catch (error) {
    console.error('Error fetching student result:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student result' },
      { status: 500 }
    );
  }
}
