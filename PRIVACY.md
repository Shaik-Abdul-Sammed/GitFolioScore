# Privacy Policy for GitFolioScore

**Effective Date:** October 30, 2026  
**Last Updated:** October 30, 2026

GitFolioScore ("we", "our", or "the App") is a bundle-only web application designed for the Anna AI OS ecosystem. We are committed to transparency and respect for your digital privacy. This Privacy Policy details how data is handled when you use GitFolioScore.

---

### 1. Information We Collect

GitFolioScore operates entirely without account registrations, user tracking, or telemetry servers:
* **Public GitHub Profile & Repository Data:** When you enter a GitHub username, the App queries the public GitHub REST API to retrieve publicly available metadata (e.g., repository names, primary languages, commit activity timestamps, star and fork counts, and public profile bios).
* **No Personally Identifiable Information (PII):** We do not collect, request, or store sensitive personal information such as passwords, personal identification numbers, physical addresses, private repository contents, or personal email addresses.

---

### 2. Data Processing and Local Storage

* **100% Client-Side Processing:** All profile scoring, algorithmic analyses, and report calculations occur directly in your web browser environment. We do not operate any backend server, remote analytics service, or third-party tracking databases.
* **Anna Host Storage (Local Caching):** To optimize performance and prevent redundant network requests against GitHub rate limits, generated reports may be cached locally using the Anna AI OS Host Storage API (`window.anna.storage`).
  - Cache entries are scoped strictly to your authenticated Anna AI OS session.
  - Cached data automatically expires after twenty-four (24) hours.
  - We do not access, transmit, or centralize this local storage data.

---

### 3. Third-Party Services

GitFolioScore communicates directly with the following trusted platforms:
* **GitHub API (`api.github.com`):** Used exclusively to fetch public developer profiles and open repository metadata over encrypted HTTPS. Use of GitHub’s service is subject to the [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement).
* **Anna AI OS Host API:** Used for sandboxed inter-process messaging, client-side storage, and secure host-level AI text generation within your operating system environment.

---

### 4. Artificial Intelligence (AI) Processing

* **LLM Analysis:** When you request AI career coaching, an anonymized summary of the computed portfolio metrics (e.g., scoring pillar totals, language diversity ratios, and public repository descriptions) is passed to your configured AI provider via Anna AI OS's `window.anna.llm.complete` API.
* **Scope of AI Use:** Data transmitted to the language model is processed solely in real time to generate prioritized repository recommendations and career insights. No data is retained, reused, or utilized by GitFolioScore to train machine learning models.

---

### 5. Cookies and Tracking Technologies

GitFolioScore does not use tracking cookies, advertising identifiers, pixel tags, or third-party session replay scripts.

---

### 6. Changes to This Policy

We may update this Privacy Policy from time to time to reflect functional improvements or changes in legal regulations. Any revisions will be reflected by the "Last Updated" date at the top of this document.

---

### 7. Contact Us

If you have questions, feedback, or concerns regarding this Privacy Policy, please contact:

**Developer:** Shaik Abdul Sammed  
**Email:** [shaikabdulsammed@gmail.com](mailto:shaikabdulsammed@gmail.com)  
**Project Repository:** [https://github.com/Shaik-Abdul-Sammed/GitFolioScore](https://github.com/Shaik-Abdul-Sammed/GitFolioScore)
