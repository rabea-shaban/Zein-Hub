import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import {
  User,
  Track,
  Program,
  InstructorProfile,
  Application,
  Enrollment,
  Module,
  Lesson,
  Quiz,
  Question,
  Assignment,
  Submission,
  Progress,
  LiveSession,
  Attendance,
  Testimonial,
} from '../src/models/index.js';

async function verifyModels() {
  console.log('Connecting to database for model verification...');
  await connectDB();

  const models = [
    { name: 'User', model: User },
    { name: 'Track', model: Track },
    { name: 'Program', model: Program },
    { name: 'InstructorProfile', model: InstructorProfile },
    { name: 'Application', model: Application },
    { name: 'Enrollment', model: Enrollment },
    { name: 'Module', model: Module },
    { name: 'Lesson', model: Lesson },
    { name: 'Quiz', model: Quiz },
    { name: 'Question', model: Question },
    { name: 'Assignment', model: Assignment },
    { name: 'Submission', model: Submission },
    { name: 'Progress', model: Progress },
    { name: 'LiveSession', model: LiveSession },
    { name: 'Attendance', model: Attendance },
    { name: 'Testimonial', model: Testimonial },
  ];

  console.log(`\nVerifying ${models.length} models and initializing indexes...`);

  for (const item of models) {
    await item.model.init();
    const indexes = await item.model.listIndexes();
    console.log(`✅ Model [${item.name}] verified. Total indexes: ${indexes.length}`);
  }

  console.log('\nAll models and compound indexes verified successfully!');
  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

verifyModels().catch((err) => {
  console.error('Error verifying models:', err);
  process.exit(1);
});
