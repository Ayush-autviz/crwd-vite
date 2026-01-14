import React from "react";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import { Card, CardContent } from "@/components/ui/card";


export default function SettingsTerms() {
  return (
    <div className="h-full flex flex-col">
      <ProfileNavbar title="Terms of Use" />

      <div className="flex-1 w-full bg-white md:rounded-2xl mt-0 md:mt-8 overflow-hidden">
        <div className="max-w-4xl mx-auto p-3 md:p-4 lg:p-6">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <div className="prose prose-blue max-w-none">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Terms of Service</h1>
                <p className="text-sm md:text-base text-gray-600 mb-6 font-medium">
                  Effective Date: January 15, 2026
                </p>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Welcome to CRWD
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    Thank you for using CRWD! These Terms of Service govern your use of the CRWD platform and services. By creating an account or making a donation through CRWD, you agree to these Terms and our Privacy Policy.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD is a collective giving platform that makes it easy to support multiple causes you care about with a single monthly donation. Our mission is to transform how people give by removing barriers and creating communities of changemakers who show up consistently for the causes that matter.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    About CRWD
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD operates through two entities:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>CRWD Foundation Inc., a 501(c)(3) nonprofit organization (EIN: 41-2423690) that receives and distributes donations to qualified nonprofits</li>
                    <li>CRWD Collective Giving LLC, which provides the technology platform and services</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    When you make a donation through CRWD, you are making a tax-deductible contribution to CRWD Foundation Inc., which then grants funds to the nonprofits you've selected.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    How Donations Work
                  </h2>
                  <h3 className="text-lg md:text-xl font-medium mb-2">Fee Structure</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    For every donation you make through CRWD:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>At least 90% goes directly to the nonprofits you've chosen to support</li>
                    <li>No more than 10% supports CRWD's operations, including platform maintenance, nonprofit verification, payment processing, marketing to reach more donors and nonprofits, and our team</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    This fee structure is transparent and applied consistently to all donations. Payment processing fees (charged by third-party processors like Stripe) are included in CRWD's operational fee.
                  </p>

                  <h3 className="text-lg md:text-xl font-medium mb-2">Disbursement Timeline</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD Foundation Inc. disburses donations to nonprofits within 60 days of receipt. Most disbursements occur within 45 days, but the 60-day window accounts for payment processing, verification, and operational requirements.
                  </p>

                  <h3 className="text-lg md:text-xl font-medium mb-2">Nonprofit Selection</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    The nonprofits listed on CRWD are verified 501(c)(3) organizations selected by CRWD based on public IRS records and our verification process. Nonprofits listed on CRWD:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Do not have a partnership or endorsement relationship with CRWD</li>
                    <li>Have not signed agreements with CRWD</li>
                    <li>Are beneficiaries of donations made through the platform</li>
                    <li>May not know they are listed on CRWD until they receive a donation</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD is not responsible for how nonprofits use donated funds after disbursement. If a nonprofit loses its 501(c)(3) status, closes, or becomes inactive after you've selected it, CRWD Foundation will reallocate your designated funds to similar qualified nonprofits.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Your Account and Responsibilities
                  </h2>
                  <h3 className="text-lg md:text-xl font-medium mb-2">Eligibility</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    You must be at least 13 years old to use CRWD. If you are under 18, you must have permission from a parent or legal guardian.
                  </p>

                  <h3 className="text-lg md:text-xl font-medium mb-2">Account Information</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    You agree to:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Provide accurate and current information when creating your account</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Update your information promptly if it changes</li>
                    <li>Notify us immediately of any unauthorized access to your account</li>
                  </ul>

                  <h3 className="text-lg md:text-xl font-medium mb-2">Acceptable Use</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    You agree to use CRWD lawfully and ethically. You will not:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Post, upload, or transmit harmful, illegal, defamatory, harassing, or misleading content</li>
                    <li>Use automated tools, bots, or scripts to access the platform</li>
                    <li>Attempt to gain unauthorized access to CRWD's systems or other users' accounts</li>
                    <li>Engage in fraudulent activity or misrepresent yourself</li>
                    <li>Use the platform in any way that could harm CRWD, its users, or its reputation</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Intellectual Property
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    All content on CRWD—including designs, logos, text, software, databases, and trademarks—is owned by CRWD or its licensors and protected by intellectual property laws. You may use CRWD's content for personal, non-commercial purposes only. Any unauthorized reproduction, modification, or distribution is prohibited.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    User-Generated Content
                  </h2>
                  <h3 className="text-lg md:text-xl font-medium mb-2">Your Submissions</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    If you submit content to CRWD (such as comments, reviews, feedback, or ideas), you grant CRWD a worldwide, non-exclusive, royalty-free license to use, modify, reproduce, and distribute your submissions for operational or promotional purposes.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    You confirm that:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Your submissions are original or you have the rights to share them</li>
                    <li>Your content does not violate others' rights or contain unlawful material</li>
                    <li>You give CRWD permission to use your content as described above</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD reserves the right to edit, remove, or report content that violates these Terms without prior notice.
                  </p>

                  <h3 className="text-lg md:text-xl font-medium mb-2">Copyright Claims</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    If you believe content on CRWD infringes your intellectual property rights, contact us at info@crwdfund.org with:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>A description of the copyrighted material</li>
                    <li>The location of the infringing content on our platform</li>
                    <li>A statement that your claim is made in good faith</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Disclaimers and Limitations of Liability
                  </h2>
                  <h3 className="text-lg md:text-xl font-medium mb-2">"As Is" Service</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    CRWD is provided "as is" without warranties of any kind, express or implied. While we work to provide a reliable and secure platform, we do not guarantee:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Uninterrupted or error-free access</li>
                    <li>That the platform will meet all your requirements</li>
                    <li>The accuracy or reliability of nonprofit information</li>
                    <li>The tax-deductibility of your specific donation (consult your tax advisor)</li>
                  </ul>

                  <h3 className="text-lg md:text-xl font-medium mb-2">Limitation of Liability</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    To the fullest extent permitted by law, CRWD, its affiliates, and team members shall not be liable for:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Indirect, incidental, consequential, or punitive damages</li>
                    <li>Loss of data, profits, or revenue</li>
                    <li>Service interruptions or errors</li>
                    <li>Actions or inactions of nonprofits receiving donations</li>
                    <li>Delays in donation disbursement due to circumstances beyond our control</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD's total liability to you shall not exceed the total amount of donations you have made through the platform in the preceding 12 months.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Indemnification
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    You agree to indemnify and hold harmless CRWD, CRWD Foundation Inc., CRWD Collective Giving LLC, and their affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, or expenses (including legal fees) arising from:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Your use of the platform</li>
                    <li>Your content submissions</li>
                    <li>Your breach of these Terms</li>
                    <li>Your violation of any law or third-party rights</li>
                  </ul>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Changes to Terms
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    CRWD may update these Terms at any time. We will notify you of material changes through the platform or via email. Continued use of CRWD after changes are posted constitutes acceptance of the updated Terms.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    If you do not agree to the changes, you must stop using the platform.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Account Termination
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-2">
                    CRWD may suspend or terminate your account if you:
                  </p>
                  <ul className="list-disc pl-5 md:pl-6 text-sm md:text-base text-gray-600 mb-3 md:mb-4 space-y-1">
                    <li>Breach these Terms</li>
                    <li>Engage in unlawful or harmful behavior</li>
                    <li>Provide false or misleading information</li>
                  </ul>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    Upon termination, your access to CRWD will cease immediately. Provisions that by their nature should survive termination (including intellectual property rights, indemnification, and limitation of liability) will remain in effect.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    You may close your account at any time by contacting us at info@crwdfund.org.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Governing Law and Disputes
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    These Terms are governed by the laws of the State of Georgia and the United States, without regard to conflict of law principles.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    Any disputes arising from these Terms or your use of CRWD will be subject to the exclusive jurisdiction of the courts located in Georgia.
                  </p>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                  </p>
                </section>

                <section className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                    Contact Us
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                    For questions about these Terms of Service, contact us at: Email: info@crwdfund.org
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
