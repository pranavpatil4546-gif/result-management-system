import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  marks: {
    maths: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    dataScience: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    dbms: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    computer: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  total: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

// Calculate derived fields before validation so required checks pass on create/update.
StudentSchema.pre('validate', function() {
  if (this.isModified('marks') && this.marks) {
    const { maths, dataScience, dbms, computer } = this.marks;
    this.total = maths + dataScience + dbms + computer;
    this.percentage = parseFloat(((this.total / 400) * 100).toFixed(2));

    if (this.percentage >= 75) {
      this.grade = 'A';
    } else if (this.percentage >= 60) {
      this.grade = 'B';
    } else if (this.percentage >= 40) {
      this.grade = 'C';
    } else {
      this.grade = 'F';
    }
  }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
