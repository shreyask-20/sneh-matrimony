require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

let adapter;
if (connectionString.includes("neon.tech")) {
  const { PrismaNeon } = require("@prisma/adapter-neon");
  adapter = new PrismaNeon({ connectionString });
} else {
  const { PrismaPg } = require("@prisma/adapter-pg");
  adapter = new PrismaPg({ connectionString });
}

const prisma = new PrismaClient({ adapter });

const EMAIL_SUFFIX = "@sneh.test";
const DEFAULT_PASSWORD = "Password123!";

const profiles = [
  {
    key: "aanya",
    fullName: "Ananya Kapoor",
    gender: "Female",
    email: "ananya.kapoor@sneh.test",
    phone: "9000000001",
    birthDate: "1997-05-14",
    maritalStatus: "Unmarried",
    height: `5'4"`,
    profession: "Product Designer",
    education: "M.Des, NID Ahmedabad",
    city: "Mumbai",
    religion: "Hindu",
    community: "Maratha",
    motherTongue: "Marathi",
    bio: "Design-led and family-oriented, with a love for travel, books, and warm conversation.",
    photo: "/profiles/wo1%20(4).jpg",
    family: {
      fatherName: "Ramesh Sharma",
      motherName: "Anita Sharma",
      totalBrothers: 1,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "26-32",
      religionCommunity: "Open to compatible Hindu families",
      locationPreference: "Mumbai or open to relocation",
      expectations: "Kindness, emotional maturity, and a steady approach to life.",
    },
  },
  {
    key: "rahul",
    fullName: "Rahul Verma",
    gender: "Male",
    email: "rahul.verma@sneh.test",
    phone: "9000000002",
    birthDate: "1995-12-03",
    maritalStatus: "Unmarried",
    height: `5'9"`,
    profession: "Finance Manager",
    education: "MBA, NMIMS",
    city: "Hyderabad",
    religion: "Hindu",
    community: "Kayastha",
    motherTongue: "Hindi",
    bio: "Calm, ambitious, and values long-term stability with a grounded partner.",
    photo: "/profiles/me1%20(1).jpg",
    family: {
      fatherName: "Sanjay Verma",
      motherName: "Kiran Verma",
      totalBrothers: 0,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 1,
    },
    preferences: {
      preferredAgeRange: "25-31",
      religionCommunity: "Open to compatible families",
      locationPreference: "Hyderabad or Bangalore",
      expectations: "Good communication, mutual respect, and shared values.",
    },
  },
  {
    key: "ananya",
    fullName: "Ananya Rao",
    gender: "Female",
    email: "ananya.rao@sneh.test",
    phone: "9000000003",
    birthDate: "1998-02-11",
    maritalStatus: "Unmarried",
    height: `5'3"`,
    profession: "Doctor",
    education: "MBBS, KIMS",
    city: "Bengaluru",
    religion: "Hindu",
    community: "Reddy",
    motherTongue: "Telugu",
    bio: "Medical professional who enjoys fitness, reading, and meaningful weekend plans.",
    photo: "/profiles/p3.png",
    family: {
      fatherName: "Prakash Rao",
      motherName: "Latha Rao",
      totalBrothers: 1,
      totalSisters: 0,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "27-33",
      religionCommunity: "Flexible, values-driven match",
      locationPreference: "Bengaluru or nearby metro cities",
      expectations: "Supportive partnership and shared long-term goals.",
    },
  },
  {
    key: "aditya",
    fullName: "Aditya Nair",
    gender: "Male",
    email: "aditya.nair@sneh.test",
    phone: "9000000004",
    birthDate: "1997-04-09",
    maritalStatus: "Unmarried",
    height: `5'11"`,
    profession: "Consultant",
    education: "B.Tech, CET + PGDM, IIM Kozhikode",
    city: "Kochi",
    religion: "Hindu",
    community: "Nair",
    motherTongue: "Malayalam",
    bio: "Travel-friendly consultant who likes structured plans, good food, and calm evenings.",
    photo: "/profiles/me1%20(2).jpg",
    family: {
      fatherName: "Mohan Nair",
      motherName: "Sujatha Nair",
      totalBrothers: 0,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "25-31",
      religionCommunity: "Open-minded and family-oriented",
      locationPreference: "Kochi, Bangalore, or flexible",
      expectations: "A partner who values honesty and easy communication.",
    },
  },
  {
    key: "sneha",
    fullName: "Sneha Iyer",
    gender: "Female",
    email: "sneha.iyer@sneh.test",
    phone: "9000000005",
    birthDate: "1996-08-21",
    maritalStatus: "Unmarried",
    height: `5'5"`,
    profession: "Product Manager",
    education: "B.Tech, Anna University + MBA",
    city: "Chennai",
    religion: "Hindu",
    community: "Iyer",
    motherTongue: "Tamil",
    bio: "Product thinker, optimistic, and close to family. Enjoys food trails and short trips.",
    photo: "/profiles/wo1%20(1).jpg",
    family: {
      fatherName: "Venkat Iyer",
      motherName: "Radha Iyer",
      totalBrothers: 1,
      totalSisters: 1,
      marriedBrothers: 1,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "27-33",
      religionCommunity: "Compatible family background",
      locationPreference: "Chennai or nearby cities",
      expectations: "Warmth, ambition, and emotional steadiness.",
    },
  },
  {
    key: "vihaan",
    fullName: "Vihaan Patel",
    gender: "Male",
    email: "vihaan.patel@sneh.test",
    phone: "9000000006",
    birthDate: "1996-09-18",
    maritalStatus: "Unmarried",
    height: `5'10"`,
    profession: "Marketing Lead",
    education: "BBA, SVNIT",
    city: "Surat",
    religion: "Hindu",
    community: "Patel",
    motherTongue: "Gujarati",
    bio: "Marketing lead who enjoys live music, cricket, and quiet family dinners.",
    photo: "/profiles/me1%20(3).jpg",
    family: {
      fatherName: "Harshad Patel",
      motherName: "Nisha Patel",
      totalBrothers: 1,
      totalSisters: 0,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "24-30",
      religionCommunity: "Open to a compatible Gujarati/Hindu match",
      locationPreference: "Surat, Ahmedabad, or flexible",
      expectations: "Kind communication and a positive outlook.",
    },
  },
  {
    key: "meera",
    fullName: "Meera Kapoor",
    gender: "Female",
    email: "meera.kapoor@sneh.test",
    phone: "9000000007",
    birthDate: "1997-11-04",
    maritalStatus: "Unmarried",
    height: `5'6"`,
    profession: "Lawyer",
    education: "LLB, Delhi University",
    city: "Ahmedabad",
    religion: "Hindu",
    community: "Punjabi",
    motherTongue: "Hindi",
    bio: "Law professional with a practical mindset and a soft spot for classical music.",
    photo: "/profiles/wo1%20(2).jpg",
    family: {
      fatherName: "Ajay Kapoor",
      motherName: "Neelam Kapoor",
      totalBrothers: 0,
      totalSisters: 2,
      marriedBrothers: 0,
      marriedSisters: 1,
    },
    preferences: {
      preferredAgeRange: "27-34",
      religionCommunity: "Compatible and respectful family values",
      locationPreference: "Ahmedabad, Delhi, or flexible",
      expectations: "A respectful, well-balanced partnership.",
    },
  },
  {
    key: "kabir",
    fullName: "Kabir Singh",
    gender: "Male",
    email: "kabir.singh@sneh.test",
    phone: "9000000008",
    birthDate: "1994-10-25",
    maritalStatus: "Unmarried",
    height: `5'11"`,
    profession: "Architect",
    education: "B.Arch, SPA Delhi",
    city: "Delhi",
    religion: "Sikh",
    community: "Punjabi",
    motherTongue: "Punjabi",
    bio: "Architecture enthusiast who enjoys sketching, slow coffee, and contemporary design.",
    photo: "/profiles/me1%20(4).jpg",
    family: {
      fatherName: "Gurpreet Singh",
      motherName: "Harpreet Kaur",
      totalBrothers: 1,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "26-32",
      religionCommunity: "Open to strong family values",
      locationPreference: "Delhi or nearby cities",
      expectations: "A thoughtful, independent, and kind partner.",
    },
  },
  {
    key: "pooja",
    fullName: "Pooja Bansal",
    gender: "Female",
    email: "pooja.bansal@sneh.test",
    phone: "9000000009",
    birthDate: "1999-01-29",
    maritalStatus: "Unmarried",
    height: `5'2"`,
    profession: "HR Manager",
    education: "MBA, Symbiosis",
    city: "Jaipur",
    religion: "Hindu",
    community: "Baniya",
    motherTongue: "Hindi",
    bio: "HR manager who loves family gatherings, music, and creating a peaceful routine.",
    photo: "/profiles/p9.jpg",
    family: {
      fatherName: "Suresh Bansal",
      motherName: "Kavita Bansal",
      totalBrothers: 0,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "25-31",
      religionCommunity: "Compatible and family-first",
      locationPreference: "Jaipur or open to relocation",
      expectations: "Consistency, respect, and positive intent.",
    },
  },
  {
    key: "nikhil",
    fullName: "Nikhil Joshi",
    gender: "Male",
    email: "nikhil.joshi@sneh.test",
    phone: "9000000010",
    birthDate: "1992-06-12",
    maritalStatus: "Unmarried",
    height: `5'8"`,
    profession: "Teacher",
    education: "M.A., Pune University",
    city: "Nagpur",
    religion: "Hindu",
    community: "Marathi",
    motherTongue: "Marathi",
    bio: "Teacher by profession, reader by habit, and someone who values stability and honesty.",
    photo: "/profiles/me1%20(5).jpg",
    family: {
      fatherName: "Vijay Joshi",
      motherName: "Sunita Joshi",
      totalBrothers: 1,
      totalSisters: 0,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "24-30",
      religionCommunity: "Open to a compatible, grounded family",
      locationPreference: "Nagpur, Pune, or flexible",
      expectations: "Patience, sincerity, and mutual respect.",
    },
  },
  {
    key: "diya",
    fullName: "Diya Desai",
    gender: "Female",
    email: "diya.desai@sneh.test",
    phone: "9000000011",
    birthDate: "1998-07-17",
    maritalStatus: "Unmarried",
    height: `5'4"`,
    profession: "Data Analyst",
    education: "B.Sc. Statistics, DAVV",
    city: "Indore",
    religion: "Hindu",
    community: "Gujarati",
    motherTongue: "Gujarati",
    bio: "Data analyst who enjoys learning new tools, long walks, and a calm home environment.",
    photo: "/profiles/wo1%20(3).jpg",
    family: {
      fatherName: "Mahesh Desai",
      motherName: "Pallavi Desai",
      totalBrothers: 0,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "26-32",
      religionCommunity: "Open to compatible and stable families",
      locationPreference: "Indore, Ahmedabad, or open",
      expectations: "Good character, steady communication, and warmth.",
    },
  },
  {
    key: "rohan",
    fullName: "Rohan Mehta",
    gender: "Male",
    email: "rohan.mehta@sneh.test",
    phone: "9000000012",
    birthDate: "1995-03-28",
    maritalStatus: "Unmarried",
    height: `5'9"`,
    profession: "Software Engineer",
    education: "B.Tech, VIT",
    city: "Pune",
    religion: "Jain",
    community: "Marwari",
    motherTongue: "Hindi",
    bio: "Engineer who likes clean products, weekend bike rides, and conversations that go somewhere.",
    photo: "/profiles/me1%20(1).jpg",
    family: {
      fatherName: "Mahendra Mehta",
      motherName: "Bhavna Mehta",
      totalBrothers: 1,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 1,
    },
    preferences: {
      preferredAgeRange: "24-30",
      religionCommunity: "Open to a compatible, modern family",
      locationPreference: "Pune, Mumbai, or flexible",
      expectations: "Mutual support, trust, and easy conversation.",
    },
  },
  {
    key: "tanvi",
    fullName: "Tanvi Mehta",
    gender: "Female",
    email: "tanvi.mehta@sneh.test",
    phone: "9000000013",
    birthDate: "1997-09-09",
    maritalStatus: "Unmarried",
    height: `5'5"`,
    profession: "UX Researcher",
    education: "M.Sc. Psychology, SNDT",
    city: "Pune",
    religion: "Hindu",
    community: "Gujarati",
    motherTongue: "Gujarati",
    bio: "Warm, thoughtful, and curious. I enjoy books, art, and long walks with good conversation.",
    photos: [
      "/profiles/wo1%20(1).jpg",
      "/profiles/wo1%20(2).jpg",
      "/profiles/wo1%20(3).jpg",
      "/profiles/wo1%20(4).jpg",
    ],
    family: {
      fatherName: "Manish Mehta",
      motherName: "Rita Mehta",
      totalBrothers: 0,
      totalSisters: 1,
      marriedBrothers: 0,
      marriedSisters: 0,
    },
    preferences: {
      preferredAgeRange: "26-32",
      religionCommunity: "Open to compatible, values-led families",
      locationPreference: "Pune, Mumbai, or flexible",
      expectations: "Respect, emotional maturity, and a steady partnership.",
    },
  },
];

const acceptedPairs = [
  ["aanya", "rahul"],
  ["sneha", "vihaan"],
  ["ananya", "aditya"],
];

const pendingInterests = [
  { from: "meera", to: "kabir", message: "Hi Kabir, I liked your profile and would love to connect." },
  { from: "nikhil", to: "pooja", message: "Hello Pooja, I think we share a lot of values. Would be nice to talk." },
  { from: "diya", to: "rohan", message: "Rohan, your profile feels thoughtful and well-rounded. Let's connect." },
];

const makeCreatedAt = (index) => {
  const date = new Date("2025-01-01T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + index * 6);
  return date;
};

const makeDate = (isoDate) => new Date(`${isoDate}T00:00:00.000Z`);

const normalizeConversationPair = (userAId, userBId) =>
  userAId < userBId
    ? { userOneId: userAId, userTwoId: userBId }
    : { userOneId: userBId, userTwoId: userAId };

async function main() {
  const password = await hash(DEFAULT_PASSWORD, 12);

  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: EMAIL_SUFFIX,
      },
    },
  });

  const createdUsers = new Map();

  const lastUser = await prisma.user.findFirst({
    where: { displayId: { not: null } },
    orderBy: { displayId: "desc" },
    select: { displayId: true },
  });
  let nextNum = lastUser?.displayId
    ? parseInt(lastUser.displayId.replace(/^C/, ""), 10) + 1
    : 1;

  for (let index = 0; index < profiles.length; index += 1) {
    const profile = profiles[index];
    const [firstName, ...rest] = profile.fullName.split(/\s+/);
    const lastName = rest.join(" ");

    const user = await prisma.user.create({
      data: {
        name: profile.fullName,
        firstName,
        lastName: lastName || null,
        email: profile.email,
        phone: profile.phone,
        password,
        displayId: `C${String(nextNum++).padStart(3, "0")}`,
        roleName: "USER",
        gender: profile.gender,
        birthDate: makeDate(profile.birthDate),
        maritalStatus: profile.maritalStatus,
        height: profile.height,
        profession: profile.profession,
        education: profile.education,
        city: profile.city,
        religion: profile.religion,
        community: profile.community,
        motherTongue: profile.motherTongue,
        bio: profile.bio,
        isApproved: true,
        profileVisible: true,
        createdAt: makeCreatedAt(index),
        photos: {
          create: (profile.photos ?? [profile.photo]).filter(Boolean).map((url) => ({
            url,
            status: "APPROVED",
            createdAt: makeCreatedAt(index),
          })),
        },
        familyDetails: {
          create: profile.family,
        },
        preferences: {
          create: profile.preferences,
        },
      },
      select: {
        id: true,
      },
    });

    createdUsers.set(profile.key, user.id);
  }

  for (const [fromKey, toKey] of acceptedPairs) {
    const fromUserId = createdUsers.get(fromKey);
    const toUserId = createdUsers.get(toKey);
    const pair = normalizeConversationPair(fromUserId, toUserId);
    const acceptedAt = new Date("2025-02-15T10:00:00.000Z");

    await prisma.interest.create({
      data: {
        fromUserId,
        toUserId,
        status: "ACCEPTED",
        message: "Loved your profile and would like to continue the conversation.",
        respondedAt: acceptedAt,
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        ...pair,
        lastMessageAt: acceptedAt,
      },
      select: {
        id: true,
      },
    });

    const senderOne = fromUserId;
    const senderTwo = toUserId;

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: senderOne,
          body: "Hi, I liked your profile and wanted to say hello.",
          createdAt: new Date("2025-02-15T10:00:00.000Z"),
          readAt: new Date("2025-02-15T10:12:00.000Z"),
        },
        {
          conversationId: conversation.id,
          senderId: senderTwo,
          body: "Thanks for reaching out. I'd love to connect more.",
          createdAt: new Date("2025-02-15T10:15:00.000Z"),
          readAt: null,
        },
      ],
    });
  }

  for (const item of pendingInterests) {
    await prisma.interest.create({
      data: {
        fromUserId: createdUsers.get(item.from),
        toUserId: createdUsers.get(item.to),
        status: "PENDING",
        message: item.message,
      },
    });
  }

  console.log(`Seeded ${profiles.length} users with sample interests and conversations.`);
  console.log(`Default password for all seeded users: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
