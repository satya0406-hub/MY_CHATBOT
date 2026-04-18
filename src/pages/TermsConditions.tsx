import { motion } from "motion/react";

export const TermsConditions = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-12 font-serif text-5xl font-bold text-white">Terms & Conditions</h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-zinc-400 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PRINCE STAR, you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use of Service</h2>
            <p>
              You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, 
              restrict, or inhibit anyone else's use and enjoyment of the service. Prohibited behavior includes 
              harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive 
              content, or disrupting the normal flow of dialogue within the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and for restricting 
              access to your computer. You agree to accept responsibility for all activities that occur under your 
              account or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p>
              The content, features, and functionality of PRINCE STAR are and will remain the exclusive property of 
              PRINCE STAR and its licensors. Our trademarks and trade dress may not be used in connection with any 
              product or service without the prior written consent of PRINCE STAR.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. AI-Generated Content</h2>
            <p>
              PRINCE STAR provides AI-generated responses. While we strive for accuracy, we do not guarantee that 
              the information provided is correct, complete, or up-to-date. Users should independently verify 
              any critical information provided by the AI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall PRINCE STAR, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your 
              access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
              PRINCE STAR operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <p className="pt-10 text-sm text-zinc-500 italic">
            Last Updated: April 9, 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};
