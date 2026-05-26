import PlanCards from "../subscription/PlanCards";

export default function Subscriptions() {
  return (
    <section className="w-full px-4 pb-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <h2 className="section-heading">Premium memberships</h2>
        <p className="section-subtitle mt-2">
          Choose a plan that suits your journey. Billed yearly.{" "}
          <span className="font-medium text-brand-600">25% introductory discount</span>{" "}
          applied at checkout.
        </p>
      </div>
      <PlanCards />
    </section>
  );
}
