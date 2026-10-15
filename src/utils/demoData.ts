import { Question, TestSet } from '../types/index.ts';

export const DEMO_QUESTIONS: Question[] = [
  {
    id: 'demo-q1',
    question: 'Under the Employees\' Provident Funds and Miscellaneous Provisions Act, 1952, what is the current statutory monthly wage ceiling for mandatory provident fund coverage?',
    options: ['₹6,500 per month', '₹15,000 per month', '₹21,000 per month', '₹25,000 per month'],
    correctAnswer: 1,
    explanation: 'Effective September 1, 2014, the statutory wage ceiling under the EPF Act was enhanced from ₹6,500 to ₹15,000 per month. An employee drawing basic wages plus DA up to ₹15,000 per month is statutorily covered.',
    topic: 'Labour Laws & EPF Act',
    reference: 'EPF & MP Act 1952, Section 2(f) & Gazette Notification No. S.O. 2259(E)'
  },
  {
    id: 'demo-q2',
    question: 'Under the Employees\' Deposit-Linked Insurance (EDLI) Scheme, 1976, what is the maximum life insurance benefit payable to the nominee or legal heir of a deceased member?',
    options: ['₹3,00,000', '₹5,00,000', '₹7,00,000', '₹10,00,000'],
    correctAnswer: 2,
    explanation: 'The Central Board of Trustees (EPFO) enhanced the maximum assurance benefit under the EDLI Scheme to ₹7,00,000 (with a minimum assurance of ₹2,50,000) for members dying while in service.',
    topic: 'Social Security Schemes',
    reference: 'EDLI Scheme 1976, Paragraph 22(3) as amended'
  },
  {
    id: 'demo-q3',
    question: 'Under Section 40-B of the Factories Act, 1948, appointment of a qualified Safety Officer is mandatory in every factory employing at least how many workers?',
    options: ['250 workers', '500 workers', '1,000 workers', '1,500 workers'],
    correctAnswer: 2,
    explanation: 'Under Section 40-B of the Factories Act, 1948, every factory wherein 1,000 or more workers are ordinarily employed, or where any manufacturing process involves risk of bodily injury or disease, must appoint Safety Officers.',
    topic: 'Labour Laws & Factories Act',
    reference: 'Factories Act 1948, Section 40-B(1)'
  },
  {
    id: 'demo-q4',
    question: 'Under the Payment of Gratuity Act, 1972, what is the current maximum ceiling on the amount of gratuity payable to an employee?',
    options: ['₹10 Lakh', '₹15 Lakh', '₹20 Lakh', '₹25 Lakh'],
    correctAnswer: 2,
    explanation: 'The Payment of Gratuity (Amendment) Act, 2018 empowered the Central Government to notify the ceiling, which was raised to ₹20 Lakhs (from the earlier ₹10 Lakhs limit).',
    topic: 'Social Security & Gratuity',
    reference: 'Payment of Gratuity Act 1972, Section 4(3) & S.O. 1420(E)'
  },
  {
    id: 'demo-q5',
    question: 'Under the Maternity Benefit (Amendment) Act, 2017, every establishment having how many or more employees is mandated to provide crèche facilities within prescribed distance?',
    options: ['30 or more employees', '50 or more employees', '100 or more employees', '150 or more employees'],
    correctAnswer: 1,
    explanation: 'Section 11A of the Maternity Benefit Act inserted by the 2017 Amendment mandates that every establishment employing 50 or more employees must provide a crèche facility within a radius of 500 meters.',
    topic: 'Social Security & Labour Welfare',
    reference: 'Maternity Benefit Act 1961, Section 11A'
  },
  {
    id: 'demo-q6',
    question: 'Which Article of the Constitution of India explicitly directs the State to take steps by legislation to secure the participation of workers in the management of undertakings?',
    options: ['Article 39(e)', 'Article 41', 'Article 42', 'Article 43A'],
    correctAnswer: 3,
    explanation: 'Article 43A was inserted into the Directive Principles of State Policy (Part IV) by the 42nd Constitutional Amendment Act, 1976 to foster workers\' participation in management.',
    topic: 'Indian Constitution & Labour Rights',
    reference: 'Constitution of India, Part IV, Article 43A'
  },
  {
    id: 'demo-q7',
    question: 'In General Accounting Principles, the convention that requires anticipation of no profits but provision for all possible losses is known as:',
    options: ['Consistency Concept', 'Conservatism (Prudence) Concept', 'Materiality Concept', 'Going Concern Concept'],
    correctAnswer: 1,
    explanation: 'The Concept of Conservatism (Prudence) states that revenues and profits are never anticipated, but all foreseeable liabilities and potential losses must be provided for in financial statements.',
    topic: 'General Accounting Principles',
    reference: 'Accounting Principles & Standard ICAI Framework'
  },
  {
    id: 'demo-q8',
    question: 'Under Accounting Standard 2 (AS-2) issued by ICAI, inventories must be valued at:',
    options: ['Historical Cost only', 'Net Realisable Value only', 'Lower of Historical Cost and Net Realisable Value', 'Replacement Cost'],
    correctAnswer: 2,
    explanation: 'Paragraph 5 of AS-2 specifies that inventories should be valued at the lower of cost and net realizable value (NRV), reflecting the prudence principle.',
    topic: 'General Accounting Principles',
    reference: 'ICAI Accounting Standard 2 (Revised)'
  },
  {
    id: 'demo-q9',
    question: 'Under the Principle of Subrogation in Insurance contracts, when does the insurer acquire the rights of the insured against third parties?',
    options: [
      'Upon issuance of the insurance policy',
      'Immediately when a loss event occurs',
      'Only after settling the indemnity claim of the insured',
      'When notice of claim is served by the policyholder'
    ],
    correctAnswer: 2,
    explanation: 'Subrogation is a corollary of the principle of indemnity. The insurer steps into the shoes of the insured to recover from third parties ONLY after full settlement and payment of the indemnified claim.',
    topic: 'Insurance Principles',
    reference: 'Principles of General Insurance Law'
  },
  {
    id: 'demo-q10',
    question: 'In Auditing, which process involves examining evidence in support of an entry in the books of original entry, establishing its mathematical accuracy and validity?',
    options: ['Verification', 'Vouching', 'Valuation', 'Internal Check'],
    correctAnswer: 1,
    explanation: 'Vouching refers to the examination by an auditor of documentary evidence in support of transactions recorded in the books of account. Verification, by contrast, establishes the existence, ownership, and valuation of balance sheet assets.',
    topic: 'Principles of Auditing',
    reference: 'Standards on Auditing (SA 500: Audit Evidence)'
  },
  {
    id: 'demo-q11',
    question: 'Under the Code on Social Security, 2020, which authority is tasked with administering social security benefits for gig workers and platform workers?',
    options: [
      'Central Board of Direct Taxes',
      'National Social Security Board',
      'Directorate General of Labour Bureau',
      'Employees\' State Insurance Corporation exclusively'
    ],
    correctAnswer: 1,
    explanation: 'The Code on Social Security 2020 mandates the constitution of the National Social Security Board for recommending and monitoring schemes for unorganised, gig, and platform workers.',
    topic: 'Social Security Code 2020',
    reference: 'Code on Social Security 2020, Section 6'
  },
  {
    id: 'demo-q12',
    question: 'What is the employer\'s statutory contribution percentage towards the Employees\' Pension Scheme (EPS) out of the total 12% EPF contribution?',
    options: ['3.67%', '8.33%', '10.00%', '12.00%'],
    correctAnswer: 1,
    explanation: 'Under the EPF scheme, of the employer\'s 12% total contribution, 8.33% is diverted to the Employees\' Pension Scheme (subject to the wage ceiling), and the remaining 3.67% goes to the EPF account.',
    topic: 'Labour Laws & EPF Act',
    reference: 'Employees\' Provident Funds Scheme 1952, Paragraph 38'
  },
  {
    id: 'demo-q13',
    question: 'Under the Factories Act, 1948, no adult worker shall be required or allowed to work in a factory for more than how many hours in any day without overtime approval?',
    options: ['8 hours', '9 hours', '10 hours', '10.5 hours'],
    correctAnswer: 1,
    explanation: 'Section 54 of the Factories Act 1948 specifies daily hours: no adult worker shall be required or allowed to work in a factory for more than 9 hours in any day, subject to 48 hours weekly under Section 51.',
    topic: 'Labour Laws & Factories Act',
    reference: 'Factories Act 1948, Section 54'
  },
  {
    id: 'demo-q14',
    question: 'Under the Indian Constitution, the Comptroller and Auditor General of India (CAG) submits reports relating to the accounts of the Union to:',
    options: ['The Prime Minister', 'The Finance Minister', 'The Public Accounts Committee', 'The President of India'],
    correctAnswer: 3,
    explanation: 'Under Article 151(1) of the Constitution, the reports of the CAG relating to the accounts of the Union are submitted to the President, who causes them to be laid before each House of Parliament.',
    topic: 'Indian Polity & Governance',
    reference: 'Constitution of India, Article 151'
  },
  {
    id: 'demo-q15',
    question: 'Which of the following is considered an intangible asset with an indefinite useful life that is NOT amortised but tested annually for impairment under modern accounting standards?',
    options: ['Patent with 10-year legal term', 'Copyright', 'Purchased Goodwill', 'Specialized Software License'],
    correctAnswer: 2,
    explanation: 'Goodwill acquired in a business combination is considered to have an indefinite useful life under Ind AS 38 / IFRS 3; hence it is not subject to systematic amortization, but tested for impairment at least annually.',
    topic: 'General Accounting Principles',
    reference: 'Ind AS 36 & Ind AS 38: Intangible Assets'
  },
  {
    id: 'demo-q16',
    question: 'What is the doctrine of "Uberrimae Fidei" in insurance contracts?',
    options: [
      'Right of the insurer to cancel policy at will',
      'Contract of utmost good faith requiring full disclosure of all material facts',
      'Compensation limited to strict financial loss without betterment',
      'Transfer of rights to third-party beneficiaries'
    ],
    correctAnswer: 1,
    explanation: 'Uberrimae Fidei means "of the utmost good faith". Unlike commercial contracts subject to caveat emptor, both insurer and insured must disclose all material facts known to them prior to inception.',
    topic: 'Insurance Principles',
    reference: 'General Insurance Law Principles'
  },
  {
    id: 'demo-q17',
    question: 'Under the Industrial Disputes Act, 1947, how many days of advance notice of strike is required for workers in a public utility service?',
    options: ['At least 7 days', 'At least 14 days', 'At least 21 days', 'At least 30 days'],
    correctAnswer: 1,
    explanation: 'Under Section 22(1) of the Industrial Disputes Act 1947, no person employed in a public utility service can go on strike without giving notice within six weeks before striking and not less than 14 days before striking.',
    topic: 'Industrial Relations',
    reference: 'Industrial Disputes Act 1947, Section 22'
  },
  {
    id: 'demo-q18',
    question: 'In computer networking and security, which asymmetric cryptography algorithm relies on the computational difficulty of factoring large integers?',
    options: ['Advanced Encryption Standard (AES)', 'Rivest-Shamir-Adleman (RSA)', 'Secure Hash Algorithm 256 (SHA-256)', 'Data Encryption Standard (DES)'],
    correctAnswer: 1,
    explanation: 'RSA is an asymmetric public-key cryptosystem whose mathematical security is based on the prime factorization problem of large composite numbers.',
    topic: 'Elementary Computer Applications',
    reference: 'Computer Science Fundamentals & PKI'
  },
  {
    id: 'demo-q19',
    question: 'Under the Employees\' State Insurance (ESI) Act, 1948, what is the current monthly wage ceiling for coverage of an employee?',
    options: ['₹15,000 per month', '₹21,000 per month', '₹25,000 per month', '₹30,000 per month'],
    correctAnswer: 1,
    explanation: 'The wage limit for coverage under the ESI Act was increased to ₹21,000 per month (and ₹25,000 per month in the case of employees with disabilities) with effect from January 1, 2017.',
    topic: 'Social Security & ESI Act',
    reference: 'ESI (Central) Rules, 1950, Rule 50'
  },
  {
    id: 'demo-q20',
    question: 'In macroeconomic analysis, which indicator measures the total monetary value of all goods and services produced within a country\'s geographic borders over a specific period, adjusted for price inflation?',
    options: ['Gross National Product (GNP) at Market Prices', 'Real Gross Domestic Product (Real GDP)', 'Nominal Gross Domestic Product', 'Gross Disposable Income'],
    correctAnswer: 1,
    explanation: 'Real GDP measures the value of all finished goods and services produced within domestic borders valued at constant base-year prices, thereby adjusting for inflation and reflecting true volume growth.',
    topic: 'Indian Economy & Macroeconomics',
    reference: 'Central Statistics Office (CSO) National Accounts Framework'
  }
];

export const DEMO_TEST_SET: TestSet = {
  id: 'demo-set-1',
  noteId: 'demo-note',
  setIndex: 1,
  title: 'Official Demo Practice Set: UPSC APFC Standard',
  questions: DEMO_QUESTIONS,
  totalQuestions: 20,
  attempts: []
};

export const SAMPLE_APFC_STUDY_MATERIAL = `UPSC EPFO ASSISTANT PROVIDENT FUND COMMISSIONER (APFC)
EXAMINATION COMPREHENSIVE STUDY NOTES: INDUSTRIAL RELATIONS, LABOUR LAWS & SOCIAL SECURITY

1. THE EMPLOYEES' PROVIDENT FUNDS AND MISCELLANEOUS PROVISIONS ACT, 1952
- Scope and Applicability: Applies to every establishment which is a factory engaged in any industry specified in Schedule I and in which 20 or more persons are employed. Also applies to any other establishment notified by the Central Government employing 20 or more persons.
- Statutory Wage Ceiling: The current monthly wage limit for compulsory EPF membership is ₹15,000 per month (basic wages + dearness allowance + retaining allowance). Employees joining with basic wage above ₹15,000 can join voluntarily with joint declaration (Section 26A).
- Three Integrated Schemes:
  a) Employees' Provident Funds Scheme, 1952 (EPF): Employee contributes 12% of wages; Employer contributes 12%. Out of employer's 12%, 8.33% is remitted to the Employees' Pension Scheme (EPS) and 3.67% to EPF. In specified establishments (e.g. sick units, beedi, brick, jute), the statutory rate may be 10%.
  b) Employees' Pension Scheme, 1995 (EPS): Provides superannuation pension, widow/widower pension, children pension, and orphan pension. Minimum 10 years of eligible contributory service is mandatory for superannuation pension. Normal retirement age is 58 years. Central Government contributes 1.16% of wages up to wage ceiling.
  c) Employees' Deposit-Linked Insurance Scheme, 1976 (EDLI): Financed entirely by employer contribution of 0.5% of wages. Assures life insurance benefits ranging from minimum ₹2,50,000 up to a statutory ceiling of ₹7,00,000 to nominees upon death of employee while in active service.
- Penalties: Section 14 imposes stringent imprisonment and fines for default in payment of contributions or submissions of false declarations. Damages under Section 14B can be levied up to 100% of arrears for delayed remittances.

2. THE FACTORIES ACT, 1948
- Definition of Factory (Section 2m): Any premises where 10 or more workers are working with the aid of power, or 20 or more workers are working without the aid of power, on any day of the preceding 12 months.
- Manufacturing Process (Section 2k): Any process for making, altering, repairing, ornamenting, finishing, packing, oiling, washing, cleaning, breaking up, demolishing, or pumping oil, water or sewage, generating/transforming power, printing, composing, cold storage.
- Statutory Appointments & Welfare Provisions:
  - Safety Officers (Section 40B): Mandatory in factories employing 1,000 or more workers, or where hazardous operations occur.
  - Welfare Officers (Section 49): Mandatory in factories employing 500 or more workers.
  - Canteen (Section 46): Mandatory where more than 250 workers are ordinarily employed.
  - Rest Rooms and Lunch Rooms (Section 47): Mandatory where more than 150 workers are employed.
  - Crèche Facility (Section 48): Mandatory where more than 30 women workers are employed.
  - First-aid boxes (Section 45): At least one equipped first-aid box for every 150 workers.
- Working Hours & Overtime:
  - Daily limit: Not more than 9 hours in any day (Section 54).
  - Weekly limit: Not more than 48 hours in any week (Section 51).
  - Interval for rest: At least 30 minutes after not more than 5 hours of continuous work (Section 55).
  - Spreadover: Total period inclusive of rest intervals cannot exceed 10.5 hours in a day.
  - Overtime wage rate: Double the ordinary rate of wages (Section 59).
  - Annual leave with wages: One day for every 20 days of work performed for adults; one day for every 15 days for children, provided worker worked 240 days in preceding calendar year.

3. THE PAYMENT OF GRATUITY ACT, 1972
- Applicability: Every factory, mine, oilfield, plantation, port, railway company, and every shop or establishment in which 10 or more persons are employed. Once applicable, it continues to apply even if the number of employees drops below 10.
- Eligibility Threshold: 5 years of continuous service (defined under Section 2A). Exception: The 5-year condition does not apply where termination is due to death or disablement.
- Calculation Formula (Section 4(2)): For monthly rated employees: Gratuity = (Last drawn basic wages + DA) × 15 × (Number of completed years of service) ÷ 26 days.
- Maximum Statutory Ceiling: Enhanced to ₹20,00,000 (Twenty Lakh Rupees) via notification.
- Forfeiture Conditions: Section 4(6) permits forfeiture of gratuity only if service is terminated for riotous or disorderly conduct, acts of violence, moral turpitude, or causing financial damage (to the extent of the damage).

4. THE MATERNITY BENEFIT ACT, 1961 (AS AMENDED IN 2017)
- Coverage: Establishments employing 10 or more persons. Requires minimum 80 days of work in the 12 months immediately preceding date of expected delivery.
- Paid Leave Duration: Raised from 12 weeks to 26 weeks for up to the first two surviving children (maximum 8 weeks before expected delivery). For women having two or more surviving children, benefit is 12 weeks (maximum 6 weeks before delivery).
- Commissioning & Adopting Mothers: Entitled to 12 weeks of paid maternity benefit from the date child is handed over (child must be below 3 months of age).
- Crèche Requirement: Mandatory for establishments with 50 or more employees (Section 11A). Employer must permit 4 visits a day to the crèche, including rest intervals.
- Work from Home: Provision can be availed after 26 weeks of leave subject to mutual agreement between employer and employee.

5. INDUSTRIAL RELATIONS & LABOUR DISPUTES
- Strikes and Lockouts (Section 22 & 23 of Industrial Disputes Act 1947): Workers in public utility services cannot strike without giving 14 days' advance notice within 6 weeks before striking.
- Notice of Change (Section 9A): Employers cannot alter terms of service regarding wages, hours of work, leaves, or allowances without giving 21 days' advance written notice.
- Lay-off, Retrenchment, and Closure (Chapter V-B): Establishments employing 100 or more workers must obtain prior permission from the appropriate government before retrenchment, lay-off, or closure. Under the Industrial Relations Code 2020, this threshold is revised to 300 workers.

6. GENERAL ACCOUNTING PRINCIPLES & AUDITING
- Fundamental Accounting Assumptions: Going Concern, Consistency, and Accrual.
- Key Accounting Concepts:
  - Prudence / Conservatism: Anticipate no profits, provide for all losses.
  - Matching Principle: Expenses incurred in an accounting period must be matched against revenues earned in that same period.
  - Materiality: Financial statements should disclose all items of sufficient value to influence decisions of users.
- Valuation of Inventory (AS-2): Carried at lower of cost and net realizable value (NRV). Cost formulas permitted are FIFO or Weighted Average; LIFO is prohibited under AS-2.
- Auditing Distinction: Vouching verifies transactions and entries in books with primary evidence (receipts, vouchers). Verification proves existence, ownership, and valuation of assets and liabilities shown on the balance sheet.`;
