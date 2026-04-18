import { motion } from "motion/react";

export const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-12 font-serif text-5xl font-bold text-white">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-zinc-400 font-medium leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to PRINCE STAR. We value your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you sign in using Google, we receive your name, email address, and profile picture.</li>
              <li><strong>Chat Data:</strong> We store the content of your conversations with our AI assistant to provide history and improve your experience.</li>
              <li><strong>Usage Data:</strong> We collect information about how you interact with our site, such as pages visited and features used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
            <p>
              We use the collected data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services.</li>
              <li>To personalize your experience and remember your preferences.</li>
              <li>To communicate with you about updates or support.</li>
              <li>To monitor and analyze usage trends to improve our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Google Sign-In</h2>
            <p>
              Our platform uses Google Sign-In for authentication. By using this feature, you authorize us to access 
              certain information from your Google account as permitted by Google's privacy settings. We do not store 
              your Google password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier. You can 
              instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet 
              or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to 
              protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date.
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
