import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin, EligibleVoter, Election, Candidate } from './models';

dotenv.config();

const faculties = ['Computer Science', 'Engineering', 'Business', 'Law', 'Medicine', 'Arts & Humanities'];
const departments: Record<string, string[]> = {
  'Computer Science': ['Software Engineering', 'Cybersecurity', 'Data Science', 'AI & Machine Learning'],
  'Engineering': ['Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering'],
  'Business': ['Accounting', 'Finance', 'Marketing', 'Management'],
  'Law': ['Commercial Law', 'Criminal Law', 'International Law'],
  'Medicine': ['General Medicine', 'Pharmacy', 'Nursing'],
  'Arts & Humanities': ['English', 'History', 'Philosophy', 'Fine Arts'],
};

const firstNames = ['Adaeze', 'Chinedu', 'Fatima', 'Ibrahim', 'Kemi', 'Oluwaseun', 'Aisha', 'Emeka', 'Grace', 'David', 'Blessing', 'Samuel', 'Ngozi', 'Ahmed', 'Chioma', 'Tunde', 'Halima', 'Obinna', 'Joy', 'Yusuf', 'Amara', 'Peter', 'Zainab', 'Victor', 'Ruth', 'Hassan', 'Esther', 'Daniel', 'Mary', 'James'];
const lastNames = ['Okafor', 'Adeyemi', 'Mohammed', 'Nwosu', 'Balogun', 'Obi', 'Abdullahi', 'Eze', 'Abubakar', 'Nnamdi', 'Ogundimu', 'Chukwu', 'Lawal', 'Igwe', 'Bakare', 'Okoro', 'Sani', 'Udoh', 'Garba', 'Onuoha'];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voxunite';
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Admin.deleteMany({});
  await EligibleVoter.deleteMany({});
  await Election.deleteMany({});
  await Candidate.deleteMany({});

  // Create admin
  const admin = await Admin.create({ email: 'admin@university.edu', password: 'Admin@VoxUnite2024', fullName: 'Dr. Sarah Johnson', role: 'super_admin' });
  console.log('Admin created:', admin.email);

  // Create 200 eligible voters
  const voters = [];
  const batchId = 'seed-' + Date.now().toString(36);
  for (let i = 0; i < 200; i++) {
    const faculty = faculties[i % faculties.length];
    const deptList = departments[faculty];
    const dept = deptList[i % deptList.length];
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const sid = `STU${String(2024000 + i).padStart(7, '0')}`;
    voters.push({ studentId: sid, fullName: `${fn} ${ln}`, email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@university.edu`, faculty, department: dept, importBatchId: batchId });
  }
  await EligibleVoter.insertMany(voters);
  console.log(`${voters.length} voters created`);

  // Create election
  const election = await Election.create({
    title: 'Student Union General Election 2024/2025',
    description: 'Annual student union election for the 2024/2025 academic session. All eligible students are encouraged to vote for their preferred candidates.',
    facultyScope: ['All'],
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active',
    rules: ['Each student can only vote once', 'Results are final and binding', 'Campaign materials must be removed before voting', 'No campaigning within the polling area'],
    positions: [
      { title: 'President', maxVotes: 1, order: 1 },
      { title: 'Vice President', maxVotes: 1, order: 2 },
      { title: 'General Secretary', maxVotes: 1, order: 3 },
      { title: 'Treasurer', maxVotes: 1, order: 4 },
    ],
    totalEligibleVoters: 200,
    createdBy: admin._id,
  });

  // Create candidates
  const candidateData = [
    { fullName: 'Chidera Okonkwo', position: 'President', slogan: 'Unity in Progress', manifesto: 'I pledge to create a more inclusive campus environment, improve student welfare programs, and establish stronger communication between students and administration.', faculty: 'Computer Science', department: 'Software Engineering' },
    { fullName: 'Amina Yusuf', position: 'President', slogan: 'Your Voice, Our Mission', manifesto: 'My vision includes modernizing campus facilities, introducing mental health support programs, and advocating for reduced tuition fees.', faculty: 'Law', department: 'International Law' },
    { fullName: 'Emmanuel Adeyemi', position: 'President', slogan: 'Leading with Integrity', manifesto: 'I will fight for transparent governance, improved academic resources, and better career development opportunities for all students.', faculty: 'Business', department: 'Management' },
    { fullName: 'Fatimah Bello', position: 'Vice President', slogan: 'Together We Rise', manifesto: 'Supporting student initiatives, promoting diversity, and ensuring every faculty has equal representation.', faculty: 'Medicine', department: 'General Medicine' },
    { fullName: 'Olumide Bakare', position: 'Vice President', slogan: 'Action Over Words', manifesto: 'I will work to improve campus security, enhance recreational facilities, and create more internship opportunities.', faculty: 'Engineering', department: 'Civil Engineering' },
    { fullName: 'Grace Nwosu', position: 'General Secretary', slogan: 'Organized for Success', manifesto: 'Efficient administration, transparent record-keeping, and timely communication of all union activities.', faculty: 'Arts & Humanities', department: 'English' },
    { fullName: 'Ibrahim Hassan', position: 'General Secretary', slogan: 'Bridging the Gap', manifesto: 'I will ensure all students are informed, engaged, and heard through modern communication channels.', faculty: 'Computer Science', department: 'Data Science' },
    { fullName: 'Blessing Okoro', position: 'Treasurer', slogan: 'Fiscal Responsibility', manifesto: 'I pledge transparent financial management, timely budget reports, and fair allocation of resources to all student activities.', faculty: 'Business', department: 'Accounting' },
    { fullName: 'Daniel Obi', position: 'Treasurer', slogan: 'Every Naira Counts', manifesto: 'I will implement a digital tracking system for all union expenses and ensure accountability in financial matters.', faculty: 'Business', department: 'Finance' },
  ];

  for (const c of candidateData) {
    await Candidate.create({ ...c, electionId: election._id });
  }
  console.log(`${candidateData.length} candidates created`);
  console.log('\n✅ Seed complete!');
  console.log('Admin login: admin@university.edu / Admin@VoxUnite2024');
  console.log(`Sample student: ${voters[0].studentId} / ${voters[0].email}`);
  process.exit(0);
}

seed().catch((err) => { console.error('Seed error:', err); process.exit(1); });
