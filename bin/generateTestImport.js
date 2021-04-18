const students = [[
  'group',
  'account_number',
  'first_name',
  'last_name',
  'email',
]];

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

let studentId = 0;
const numGroups = rnd(5, 10);
for (let groupId = 1; groupId <= numGroups; groupId += 1) {
  const numStudents = rnd(15, 60);

  for (let i = 0; i < numStudents; i += 1) {
    studentId += 1;
    const generateEmail = Math.random() < 0.5;
    students.push([
      `Group ${groupId}`,
      studentId,
      'Student',
      `Number ${studentId}`,
      generateEmail ? `student${studentId}@test.domain.tld` : '',
    ]);
  }
}

console.log(students.join('\n'));
