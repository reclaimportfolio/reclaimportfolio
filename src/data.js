/* ============ MOCK DATA ============ */
export const SERVICES=[
  {n:'01',title:'Unclaimed Property Recovery',desc:'Locate and support claims for dormant accounts, abandoned funds, state-held property, insurance proceeds, inheritance-linked funds, and other recoverable assets.',icons:['vault','archive']},
  {n:'02',title:'Financial Asset Recovery',desc:'Investigative support for lost investments, forgotten accounts, escrow balances, business receivables, pension-related funds, and legacy financial records.',icons:['chart','briefcase']},
  {n:'03',title:'Cryptocurrency Investigation',desc:'Blockchain tracing, wallet analysis, transaction mapping, exchange attribution support, scam investigation, and digital asset intelligence.',icons:['network','coins']},
  {n:'04',title:'Crypto Compliance & Risk',desc:'Support for AML reviews, transaction risk assessment, counterparty screening, documentation, and compliance-ready investigation reports.',icons:['shield','scan']},
  {n:'05',title:'Fraud & Scam Case Review',desc:'Structured intake and evidence review for suspected crypto scams, phishing events, investment fraud, romance scams, and unauthorized transfers.',icons:['alert','eye']},
  {n:'06',title:'Institutional Recovery Support',desc:'Specialized case handling for businesses, family offices, law firms, compliance teams, and financial institutions.',icons:['building','scale']},
];
export const STEPS=[
  {n:'01',t:'Submit Confidential Case',d:'Share what happened and the records you hold.'},
  {n:'02',t:'Evidence & Asset Review',d:'We assess documentation and recoverability.'},
  {n:'03',t:'Investigation & Tracing',d:'Research, tracing and attribution work begins.'},
  {n:'04',t:'Claim Strategy',d:'A case-dependent path forward is outlined.'},
  {n:'05',t:'Recovery Support',d:'We assist with filings and pursuit where possible.'},
  {n:'06',t:'Reporting & Closure',d:'You receive a documented case report.'},
];
export const CRYPTO_FEAT=[
  {ic:'network',t:'Wallet & Transaction Tracing',d:'Map fund movement across addresses and chains with structured evidence trails.'},
  {ic:'building',t:'Exchange Attribution Support',d:'Identify likely off-ramps and platform touchpoints to support recovery routes.'},
  {ic:'alert',t:'Scam Pattern Analysis',d:'Compare case behaviour against known fraud and laundering typologies.'},
  {ic:'shield',t:'AML Risk Review',d:'Assess counterparty and transaction risk for compliance-ready output.'},
  {ic:'clock',t:'Evidence Timeline Creation',d:'Build a clear chronological record suitable for third parties.'},
  {ic:'doc',t:'Investigation Reports',d:'Deliver documented findings prepared for legal and compliance teams.'},
];
export const ASSETS=['Unclaimed Property','Dormant Bank Accounts','Insurance Proceeds','Pension & Retirement Funds','Inheritance Assets','Escrow Balances','Business Receivables','Forgotten Investments','Cryptocurrency Assets','Wallet Transfers','Exchange Accounts','Fraud-Linked Funds'];
export const TRUST=[
  {ic:'lock',t:'Confidential by Design',d:'Every case is handled discreetly with restricted internal access.'},
  {ic:'scan',t:'Evidence-Led Recovery',d:'We work from documentation and traceable records, not assumptions.'},
  {ic:'shield',t:'Compliance-Aware Process',d:'Our workflows are built to align with AML and reporting expectations.'},
  {ic:'users',t:'Human Review, Not Automation',d:'Specialists assess each case. No black-box decisioning.'},
  {ic:'mail',t:'Clear Communication',d:'You receive honest, plain updates on case-dependent prospects.'},
  {ic:'vault',t:'Secure Case Handling',d:'Records and evidence are stored with controlled access.'},
];
export const CASE_STUDIES=[
  {cat:'Financial Asset Recovery',title:'Dormant Investment Account Review',problem:'A client believed a legacy brokerage account had been left inactive for over a decade.',approach:'Records research, custodian outreach support, and documentation assembly.',outcome:'A recoverable balance was identified and a claim pathway was outlined for the client to pursue.'},
  {cat:'Crypto Investigation',title:'Blockchain Scam Transaction Mapping',problem:'Funds were sent to an address following a fraudulent investment platform.',approach:'On-chain tracing, clustering analysis and exchange attribution support.',outcome:'A documented transaction timeline was produced to support reporting to relevant parties.'},
  {cat:'Estate Assets',title:'Estate-Linked Asset Discovery',problem:'An estate executor suspected unclaimed property tied to the deceased.',approach:'Multi-jurisdiction unclaimed property review and inheritance-linked record checks.',outcome:'Several asset categories were flagged for the estate to evaluate and claim where eligible.'},
  {cat:'Institutional Support',title:'Business Receivable Recovery Support',problem:'A company carried aged receivables with incomplete counterparty records.',approach:'Counterparty research, record reconstruction and structured case documentation.',outcome:'Prioritised recovery targets were identified with supporting evidence packs.'},
];
export const CLIENT_TYPES=['Individuals','Families & Estates','Businesses','Investors','Law Firms','Compliance Teams','Financial Institutions','Crypto Users'];
export const TESTIMONIALS=[
  {q:'The team was methodical and never overpromised. We finally had a clear, documented picture of what was recoverable.',n:'Margaret Ellison',r:'Estate Executor'},
  {q:'Their blockchain tracing report gave our compliance team exactly the structured evidence we needed to move forward.',n:'David Renner',r:'Head of Risk, Fintech'},
  {q:'Professional, discreet and honest about what was case-dependent. That candour is rare and it built real trust.',n:'Priya Anand',r:'Private Investor'},
];
export const BLOG=[
  {id:'p1',title:'How Unclaimed Property Recovery Works',cat:'Asset Recovery',date:'Apr 28, 2025',author:'Research Desk',status:'Published',excerpt:'A practical look at how dormant assets end up state-held and the steps involved in evaluating a claim.',body:['Unclaimed property covers a wide range of assets that have gone dormant — uncashed cheques, forgotten accounts, insurance proceeds and more. After a defined period of inactivity, these are often transferred to state custody.','Recovery begins with identifying which jurisdictions may hold property linked to a person or estate, then assembling the documentation needed to verify a rightful claim.','The process is case-dependent. Outcomes rely on accurate records, jurisdiction rules and third-party cooperation, which is why a structured evidence review matters before any claim is pursued.']},
  {id:'p2',title:'What To Do After a Crypto Scam',cat:'Crypto',date:'Apr 14, 2025',author:'Investigations Team',status:'Published',excerpt:'Immediate steps that help preserve evidence and keep recovery options open after a suspected crypto fraud.',body:['The hours after discovering a crypto scam matter. Preserving evidence early gives any later investigation a stronger foundation.','Record every transaction hash, wallet address and communication. Avoid sending further funds — recovery scams frequently target those who have already lost money.','A professional review can map where funds moved and whether attribution to an exchange is possible, but recovery is never guaranteed and depends heavily on case facts.']},
  {id:'p3',title:'Understanding Blockchain Transaction Tracing',cat:'Crypto',date:'Mar 30, 2025',author:'Investigations Team',status:'Published',excerpt:'How analysts follow funds across addresses and chains, and what tracing can and cannot establish.',body:['Blockchain tracing follows the movement of funds across public ledgers. Because most chains are transparent, analysts can reconstruct paths between addresses.','Clustering techniques group addresses likely controlled by the same entity, while exchange attribution can indicate where funds may have been off-ramped.','Tracing builds a documented evidence trail. It does not, on its own, recover funds — it informs the strategy that recovery efforts depend on.']},
  {id:'p4',title:'Preparing Documents for Asset Recovery',cat:'Asset Recovery',date:'Mar 12, 2025',author:'Research Desk',status:'Published',excerpt:'A checklist-style guide to the records that strengthen a recovery case before it begins.',body:['Strong documentation is the backbone of any recovery effort. The more verifiable a claim, the smoother the process tends to be.','Useful records include account statements, identity documents, correspondence, contracts and any evidence linking the claimant to the asset.','Gathering these before intake helps a specialist assess recoverability accurately and avoids delays once a case is opened.']},
  {id:'p5',title:'Crypto Compliance Basics for Businesses',cat:'Compliance',date:'Feb 26, 2025',author:'Compliance Desk',status:'Published',excerpt:'An introduction to AML expectations and transaction risk review for businesses handling digital assets.',body:['Businesses interacting with digital assets increasingly face AML and risk-review expectations from partners and regulators.','Core practices include counterparty screening, transaction risk assessment and maintaining documentation that can withstand external review.','Compliance-ready investigation reports help businesses demonstrate diligence and respond confidently when questions arise.']},
];
export const CASES=[
  {id:'RP-2041',client:'Margaret Ellison',asset:'Inheritance Assets',cat:'Asset Recovery',priority:'High',status:'In Progress',date:'2025-05-02',inv:'A. Cole'},
  {id:'RP-2040',client:'Renner Capital',asset:'Cryptocurrency Assets',cat:'Crypto Investigation',priority:'High',status:'Open',date:'2025-05-01',inv:'J. Mensah'},
  {id:'RP-2038',client:'David Okafor',asset:'Dormant Bank Accounts',cat:'Asset Recovery',priority:'Medium',status:'Pending Review',date:'2025-04-27',inv:'Unassigned'},
  {id:'RP-2035',client:'Lina Park',asset:'Wallet Transfers',cat:'Fraud Review',priority:'High',status:'In Progress',date:'2025-04-22',inv:'J. Mensah'},
  {id:'RP-2031',client:'Hartwell Estate',asset:'Unclaimed Property',cat:'Asset Recovery',priority:'Medium',status:'In Progress',date:'2025-04-18',inv:'A. Cole'},
  {id:'RP-2027',client:'Vance & Lowe LLP',asset:'Business Receivables',cat:'Institutional',priority:'Low',status:'Closed',date:'2025-04-09',inv:'S. Adeyemi'},
  {id:'RP-2024',client:'Priya Anand',asset:'Forgotten Investments',cat:'Asset Recovery',priority:'Medium',status:'Closed',date:'2025-04-01',inv:'A. Cole'},
  {id:'RP-2019',client:'Northbridge Family Office',asset:'Escrow Balances',cat:'Institutional',priority:'Medium',status:'Pending Review',date:'2025-03-26',inv:'Unassigned'},
  {id:'RP-2014',client:'Tomas Reyes',asset:'Exchange Accounts',cat:'Crypto Investigation',priority:'High',status:'In Progress',date:'2025-03-19',inv:'J. Mensah'},
  {id:'RP-2009',client:'Eleanor Voss',asset:'Insurance Proceeds',cat:'Asset Recovery',priority:'Low',status:'Closed',date:'2025-03-08',inv:'S. Adeyemi'},
];
export const INTAKE=[
  {id:'IN-588',name:'Karl Jensen',email:'kjensen@mail.com',type:'Cryptocurrency Assets',value:'$45,000 – $90,000',cat:'Fraud & Scam',date:'2025-05-03',state:'New'},
  {id:'IN-587',name:'Aisha Bello',email:'aisha.b@mail.com',type:'Dormant Bank Accounts',value:'Unknown',cat:'Asset Recovery',date:'2025-05-03',state:'New'},
  {id:'IN-585',name:'Greg Mason',email:'gmason@mail.com',type:'Wallet Transfers',value:'$10,000 – $25,000',cat:'Crypto Investigation',date:'2025-05-02',state:'Reviewing'},
  {id:'IN-582',name:'Helena Cruz',email:'hcruz@mail.com',type:'Inheritance Assets',value:'$100,000+',cat:'Asset Recovery',date:'2025-04-30',state:'Reviewing'},
  {id:'IN-579',name:'Owen Pratt',email:'opratt@mail.com',type:'Escrow Balances',value:'$25,000 – $45,000',cat:'Institutional',date:'2025-04-29',state:'Converted'},
  {id:'IN-576',name:'Mei Lin',email:'meilin@mail.com',type:'Exchange Accounts',value:'Unknown',cat:'Crypto Investigation',date:'2025-04-27',state:'Closed'},
];
export const CRYPTO_CASES=[
  {id:'CX-114',wallet:'0x7a3f...d92b',tx:'0x9c1e...4af0',chain:'Ethereum',risk:'High',related:7,exch:'Binance, Kraken',status:'In Progress'},
  {id:'CX-112',wallet:'bc1qx...8h2k',tx:'4e7a...0b3d',chain:'Bitcoin',risk:'High',related:4,exch:'Unknown',status:'Open'},
  {id:'CX-109',wallet:'0x14bd...77ac',tx:'0x2f8d...91ee',chain:'Polygon',risk:'Medium',related:3,exch:'Coinbase',status:'In Progress'},
  {id:'CX-105',wallet:'Tfx9...mq2L',tx:'a18c...77fd',chain:'Tron',risk:'Medium',related:2,exch:'OKX',status:'Pending Review'},
  {id:'CX-101',wallet:'0x5e2a...c4b1',tx:'0x77ce...02da',chain:'Ethereum',risk:'Low',related:1,exch:'Kraken',status:'Closed'},
];
export const CLIENTS=[
  {id:'CL-31',name:'Margaret Ellison',type:'Individual',country:'United Kingdom',cases:2,since:'2025-02'},
  {id:'CL-30',name:'Renner Capital',type:'Institution',country:'United States',cases:3,since:'2025-01'},
  {id:'CL-28',name:'Hartwell Estate',type:'Family & Estate',country:'Canada',cases:1,since:'2025-03'},
  {id:'CL-26',name:'Vance & Lowe LLP',type:'Law Firm',country:'United States',cases:4,since:'2024-11'},
  {id:'CL-24',name:'Priya Anand',type:'Investor',country:'Singapore',cases:1,since:'2025-03'},
  {id:'CL-21',name:'Northbridge Family Office',type:'Institution',country:'Switzerland',cases:2,since:'2024-12'},
];
export const DOCUMENTS=[
  {id:'DOC-902',name:'Ellison_Estate_Records.pdf',case:'RP-2041',type:'Evidence',size:'2.4 MB',date:'2025-05-02'},
  {id:'DOC-898',name:'Renner_Wallet_Trace.xlsx',case:'RP-2040',type:'Analysis',size:'880 KB',date:'2025-05-01'},
  {id:'DOC-894',name:'Okafor_Bank_Statement.pdf',case:'RP-2038',type:'Evidence',size:'1.1 MB',date:'2025-04-27'},
  {id:'DOC-889',name:'Park_Transaction_Timeline.pdf',case:'RP-2035',type:'Report',size:'640 KB',date:'2025-04-24'},
  {id:'DOC-882',name:'Hartwell_Property_Search.pdf',case:'RP-2031',type:'Report',size:'1.7 MB',date:'2025-04-20'},
  {id:'DOC-876',name:'VanceLowe_Receivables.csv',case:'RP-2027',type:'Evidence',size:'210 KB',date:'2025-04-10'},
];
export const REPORTS=[
  {id:'REP-58',title:'Q1 Recovery Activity Summary',type:'Internal',date:'2025-04-05',status:'Final'},
  {id:'REP-56',title:'Renner Capital — Tracing Report',type:'Client',date:'2025-05-01',status:'Draft'},
  {id:'REP-54',title:'Park Case — Evidence Timeline',type:'Client',date:'2025-04-24',status:'Final'},
  {id:'REP-51',title:'Hartwell Estate — Asset Discovery',type:'Client',date:'2025-04-20',status:'Final'},
  {id:'REP-49',title:'AML Risk Review — CX-114',type:'Compliance',date:'2025-05-03',status:'Draft'},
];
export const TEAM=[
  {name:'Adrian Cole',role:'Lead Asset Recovery Specialist',email:'a.cole@reclaimportfolio.com',cases:14},
  {name:'Joy Mensah',role:'Senior Blockchain Investigator',email:'j.mensah@reclaimportfolio.com',cases:11},
  {name:'Sade Adeyemi',role:'Compliance & Risk Analyst',email:'s.adeyemi@reclaimportfolio.com',cases:9},
  {name:'Marcus Hale',role:'Research & Documentation Lead',email:'m.hale@reclaimportfolio.com',cases:12},
  {name:'Nadia Soto',role:'Client Intake Coordinator',email:'n.soto@reclaimportfolio.com',cases:0},
  {name:'Tobias Fenn',role:'Institutional Case Manager',email:'t.fenn@reclaimportfolio.com',cases:6},
];
export const ACTIVITY=[
  {d:'2h ago',t:'New intake submission IN-588 received — Cryptocurrency Assets.'},
  {d:'5h ago',t:'Case RP-2041 status updated to In Progress by A. Cole.'},
  {d:'1d ago',t:'Tracing report drafted for crypto case CX-114.'},
  {d:'1d ago',t:'Client CL-31 added two evidence documents.'},
  {d:'2d ago',t:'Case RP-2027 closed and final report delivered.'},
];
