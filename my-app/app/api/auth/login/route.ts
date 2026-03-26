import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, password, role } = await req.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    // Admin login
    if (role === 'admin') {
      if (userId === 'admin' && password === 'admin123') {
        return NextResponse.json({
          success: true,
          user: { id: 'admin', role: 'admin', name: 'Admin' },
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid admin credentials' },
          { status: 401 }
        );
      }
    }

    // Student login
    const student = await Student.findOne({ studentId: userId.toUpperCase() });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student ID not found. Contact your admin.' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: student.studentId,
        role: 'student',
        name: student.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
