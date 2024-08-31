export const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    mobile: 1234567890,
    type: 'admin',
    password: 'hashedpassword1',
  },
  {
    id: 2,
    name: 'Internal User',
    email: 'internal@example.com',
    mobile: 2345678901,
    type: 'internal',
    password: 'hashedpassword2',
  },
  {
    id: 3,
    name: 'External User',
    email: 'external@example.com',
    mobile: 3456789012,
    type: 'external',
    password: 'hashedpassword3',
  },
];

export const user_messages = [
  {
    text: 'Hello, from User',
    sentBy: 2,
    recepientType: "admin",
  },
  {
    text: 'User wants to chat',
    sentBy: 3,
    recepientType: "admin",
  },
]

export const admin_messages = [
  {
    text: 'Hi, from Admin',
    sentTo: 2,
    sentBy: 1
  },
  {
    text: 'Admin Approves!!!',
    sentTo: 2,
    sentBy: 1,
  },
  {
    text: 'Hi, from Admin',
    sentTo: 3,
    sentBy: 1
  },
  {
    text: 'Admin Approves!!!',
    sentTo: 3,
    sentBy: 1,
  },
];