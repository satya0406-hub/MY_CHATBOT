import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

export const Disclaimer = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-12 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
            <AlertTriangle size={32} />
          </div>
          <h1 className="font-serif text-5xl font-bold text-white">Disclaimer</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-8 text-zinc-400 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. AI-Generated Content</h2>
            <p>
              PRINCE STAR utilizes advanced artificial intelligence models to generate responses. Please be aware 
              that AI-generated content may contain inaccuracies, biases, or outdated information. The responses 
              provided by the AI should not be considered as professional, legal, medical, or financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. No Guarantee of Accuracy</h2>
            <p>
              While we continuously work to improve the quality and accuracy of our AI, we make no representations 
              or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
              suitability, or availability with respect to the website or the information, products, services, 
              or related graphics contained on the website for any purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Discretion</h2>
            <p>
              Any reliance you place on such information is therefore strictly at your own risk. It is your 
              responsibility to evaluate the accuracy, completeness, or usefulness of any information, opinion, 
              advice, or other content available through PRINCE STAR.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. External Links</h2>
            <p>
              Through this website, you may be able to link to other websites which are not under the control of 
              PRINCE STAR. We have no control over the nature, content, and availability of those sites. The 
              inclusion of any links does not necessarily imply a recommendation or endorse the views expressed 
              within them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              In no event will we be liable for any loss or damage including without limitation, indirect or 
              consequential loss or damage, or any loss or damage whatsoever arising from loss of data or 
              profits arising out of, or in connection with, the use of this website.
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
