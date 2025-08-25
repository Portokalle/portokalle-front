import Image from "next/image";

export default function ClinicBenefitsSection() {
  return (
    <section className="w-full py-16 px-2 bg-orange-50 mb-12 flex items-center justify-center">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">Why Portokalle?</h3>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Benefits for Clinics</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-left">
            <li>Run your clinic online and manage all patients in one place</li>
            <li>Easy appointment scheduling and management</li>
            <li>Collect payments securely and instantly</li>
            <li>Access to a network of healthcare professionals</li>
            <li>Centralized patient records and communication</li>
            <li>Analytics and reporting for clinic performance</li>
          </ul>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="https://portokalle-storage.fra1.digitaloceanspaces.com/img/Screenshot%202025-08-25%20at%209.27.02%E2%80%AFPM.png"
            alt="Clinic management"
            width={340}
            height={340}
            className="object-cover w-full h-64 sm:h-80 rounded-2xl shadow border-2 border-orange-100 bg-white"
            priority
          />
        </div>
      </div>
    </section>
  );
}
