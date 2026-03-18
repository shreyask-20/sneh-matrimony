export type Profile = {
  id: number;
  name: string;
  age: number;
  location: string;
  faith: string;
  education: string;
  height: string;
  image: string;
  verified?: boolean;
  premium?: boolean;
  about: string;
};

export const profiles: Profile[] = [
  {
    id: 1,
    name: "Aanya Sharma",
    age: 27,
    location: "Mumbai",
    faith: "Hindu",
    education: "M.Des",
    height: "5'4\"",
    image: "/profiles/p1.jpg",
    verified: true,
    premium: true,
    about:
      "Warm, artistic, and family-oriented. Loves music, coastal travel, and Sunday brunches.",
  },
  {
    id: 2,
    name: "Raghav Mehta",
    age: 30,
    location: "Pune",
    faith: "Jain",
    education: "B.Tech",
    height: "5'9\"",
    image: "/profiles/p2.jpg",
    verified: true,
    about:
      "Calm, thoughtful, and grounded. Enjoys trekking, reading, and long drives.",
  },
  {
    id: 3,
    name: "Sara Khan",
    age: 26,
    location: "Hyderabad",
    faith: "Muslim",
    education: "MBBS",
    height: "5'5\"",
    image: "/profiles/p3.png",
    premium: true,
    about:
      "Compassionate and driven. Loves cooking, wellness, and meaningful conversations.",
  },
  {
    id: 4,
    name: "Arjun Nair",
    age: 29,
    location: "Bengaluru",
    faith: "Christian",
    education: "MBA",
    height: "5'8\"",
    image: "/profiles/p4.jpg",
    about:
      "Curious and optimistic. Enjoys travel photography and hosting friends.",
  },
  {
    id: 5,
    name: "Priya Desai",
    age: 28,
    location: "Ahmedabad",
    faith: "Hindu",
    education: "CA",
    height: "5'3\"",
    image: "/profiles/p5.png",
    verified: true,
    about:
      "Balanced and family-focused. Loves art exhibits, coffee, and volunteering.",
  },
];
