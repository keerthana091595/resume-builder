/* ================================================================
   FIXED PROJECT DESCRIPTIONS — JD mode only
================================================================ */
export const FPD = {
  florida: `This initiative drives the digital modernization of the core insurance shopping and member enrollment ecosystem to provide a seamless end-to-end experience for Florida residents. The project bridges two critical domains: a high-traffic shopping application for plan discovery and a post-enrollment portal for daily healthcare management, including claims tracking and physician selection. The engineering focus centers on architecting the shared backend services and APIs that ensure consistent data flow and 100% availability during high-pressure Open Enrollment periods. By simplifying complex eligibility logic and supporting millions of concurrent users, the platform serves as the primary gateway for residents to access and manage their healthcare benefits. This transformation ensures a secure, scalable foundation that connects initial enrollment to long-term healthcare management.`,
  crateAndBarrel: `The project centered on the optimization of an end-to-end e-commerce checkout platform, managing the customer journey from initial cart validation to final order fulfillment. The system scope included complex promotional logic, tax and shipping calculations, and secure payment processing to facilitate high-volume retail transactions. Engineering efforts focused on transitioning legacy order management modules into a distributed architecture to enhance platform scalability and reliability during peak holiday shopping seasons. The primary goal involved reducing revenue leakage through sophisticated business rule validation while ensuring a seamless, high-integrity experience for millions of global customers.`,
  usfoods: `The project centered on expanding US Foods' customer-facing web ordering application and personalized product discovery experience, enabling 250,000+ independent restaurant, hospitality, and healthcare operators to self-serve product browsing, multi-list order management, and invoice visibility across responsive web interfaces. The system scope encompassed an Angular-based product catalog with operator-specific contract pricing overlays, purchase history-driven recommendation logic, multi-buyer account management supporting department-level ordering lists, and real-time invoice access integrated with backend ERP systems. Engineering efforts focused on building scalable RESTful APIs decoupling the front-end experience layer from legacy backend systems, implementing session-aware personalization pipelines using historical transaction data, and optimizing catalog search and filter performance to support a 350,000+ SKU product assortment. The primary goal involved accelerating self-service e-commerce adoption, directly contributing to measurable increases in average order value, customer retention, and reduced dependency on field sales-assisted ordering.`,
  sixbase: `The project involved the backend transformation of a comprehensive patient wellness and engagement platform designed for large-scale healthcare providers. The primary objective focused on replacing a monolithic server architecture with a distributed services ecosystem to support real-time health data processing. Development centered on building secure, HIPAA-compliant interfaces for patient enrollment, clinical goal tracking, and provider communication. Engineering efforts targeted the optimization of database performance for millions of patient records and the establishment of stable delivery pipelines for healthcare features. The platform successfully supported over 500,000 active participants in clinical wellness programs across the region via high-availability on-premise infrastructure.`
};

/* ================================================================
   SHARED ANTI-AI RULES
================================================================ */
export const SHARED = `
ANTI-AI DETECTION PROTOCOL:
- Vocabulary Ban: NEVER use "enhanced", "optimized", "leveraged", "empowered", "facilitated", "comprehensive", "strategic", "transformation", "cutting-edge", "mastered", "engineered", "expertly", "seamlessly", "spearheaded", "innovative", "highly", "robust", "proven track record", "skilled in", "expert in", "proficient in", "strong background", "dedicated to", "high-quality".
- Action Verbs Only: wrote, built, fixed, ran, set up, coded, changed, checked, moved, deployed, maintained, developed, configured, managed, supported.
- Variable Sentence Structure: Vary how technical context is introduced — never start every bullet the same way.
- Human Nuance: Include specific non-glamorous details (version conflicts, legacy code issues, manual steps).

NON-NEGOTIABLE FORMATTING:
- Output resume content ONLY. Zero conversational filler.
- Headers: ALL CAPS.
- Bullets: Use ONLY hyphens (-).
- No hyperlinks, footnotes, or external references.
- VOICE: Implied first-person throughout. BANNED: he, she, they, his, her, him, Keerthana, I, my, me, we, our.
- SURGICAL BOLDING: BOLD only specific tool names, software, or technologies. NOT phrases, job titles, or action verbs.
- CASING: All bullet content in standard sentence case. NO ALL CAPS in bullet content.`;