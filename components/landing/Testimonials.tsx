import { Card, CardContent } from "../ui/card";

const testimonials = [
  {
    name: "Meera & Arnav",
    quote:
      "Sneh felt warm and personal. Our families stayed involved, and the process was genuinely joyful.",
    image: "/profiles/p1.jpg",
  },
  {
    name: "Nida & Ayaan",
    quote:
      "We loved the recommendations. The profile insights helped us start the right conversation.",
    image: "/profiles/p7.jpg",
  },
  {
    name: "Kavya & Rohit",
    quote:
      "The verification badge gave our families confidence. It made everything feel safe and premium.",
    image: "/profiles/p8.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="section-heading">Stories of Sneh</h2>
          <p className="section-subtitle mt-2">
            Real couples who found their forever through Sneh Matrimony.
          </p>
        </div>
        <div className="hidden text-sm font-semibold text-brand-500 md:block">
          Rated 4.9/5 by families
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name}>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-38 w-110 rounded-lg object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                {testimonial.name}
              </p>
              <p className="mt-4">“{testimonial.quote}”</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
