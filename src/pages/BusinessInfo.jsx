import BusinessInfoForm from "../components/BusinessInfoForm";

const BusinessInfo = () => (
  <div className="p-8 font-body">
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight font-newsreader">
          Business Information
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">
          Your workshop's public and invoicing details.
        </p>
      </div>
      <BusinessInfoForm />
    </div>
  </div>
);

export default BusinessInfo;
