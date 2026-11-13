export interface SyllabusUnit {
  id: string;
  unitNumber: number;
  title: string;
  summary: string;
  topics: {
    title: string;
    description: string;
    keyPoints: string[];
  }[];
}

export const TECHNICAL_COMMUNICATION_SYLLABUS: SyllabusUnit[] = [
  {
    id: "unit-1",
    unitNumber: 1,
    title: "Fundamentals of Technical Communication",
    summary: "Theoretical foundations of human communication, technical discourse, and informational efficiency.",
    topics: [
      {
        title: "Communication Process & Models",
        description: "The systemic exchange of information through sender, encoding, channel, receiver, decoding, and feedback loops.",
        keyPoints: [
          "Linear vs. Interactionist communication models",
          "Noise and interference channels (Physical, Psychological, Semantic)",
          "Feedback loop validity in engineering contexts"
        ]
      },
      {
        title: "Barriers to Technical Communication",
        description: "Systematic obstacles that degrade message fidelity between technical teams and non-specialist stakeholders.",
        keyPoints: [
          "Semantic barriers: Ambiguous terminology and excessive jargon",
          "Organizational barriers: Rigid hierarchy and channel filtering",
          "Interpersonal barriers: Perceptual bias and defensive communication"
        ]
      }
    ]
  },
  {
    id: "unit-2",
    unitNumber: 2,
    title: "The 7 Cs of Professional Communication",
    summary: "The essential linguistic and structural principles required for clear technical documentation and correspondence.",
    topics: [
      {
        title: "Clarity, Conciseness, & Concreteness",
        description: "Drafting messages that eliminate ambiguity and reduce cognitive processing overhead.",
        keyPoints: [
          "Clarity: Expressing one core objective per paragraph",
          "Conciseness: Removing pleonasms, circumlocution, and redundant modifiers",
          "Concreteness: Relying on precise metrics, verifiable data, and visual tables"
        ]
      },
      {
        title: "Correctness, Consideration, Completeness, & Courtesy",
        description: "Maintaining technical rigor, stakeholder empathy, and diplomatic professionalism.",
        keyPoints: [
          "Correctness: Grammatical integrity and verified technical calculations",
          "Consideration: The 'You-Attitude'—framing documentation around reader requirements",
          "Courtesy: Respectful tone and transparent technical limitations"
        ]
      }
    ]
  },
  {
    id: "unit-3",
    unitNumber: 3,
    title: "Technical Writing: Reports & Proposals",
    summary: "Formal documentation standards, architectural layouts, and investigative technical reporting.",
    topics: [
      {
        title: "Structure of a Formal Technical Report",
        description: "Standard front matter, technical body, and back matter divisions in engineering documentation.",
        keyPoints: [
          "Front Matter: Letter of transmittal, Executive summary, Table of contents",
          "Main Body: Methodology, System architecture, Empirical findings",
          "Back Matter: Appendices, Reference bibliographies, Glossary"
        ]
      },
      {
        title: "Engineering Proposals & Feasibility Studies",
        description: "Structuring technical justification, cost estimation, and risk assessment documents.",
        keyPoints: [
          "Problem statement articulation and proposed solution scope",
          "Budgetary projections and Gantt chart milestone scheduling",
          "Deliverables breakdown and warranty conditions"
        ]
      }
    ]
  },
  {
    id: "unit-4",
    unitNumber: 4,
    title: "Organizational Correspondence & Meeting Protocols",
    summary: "Short-form professional communications including memorandums, notices, agendas, and minutes.",
    topics: [
      {
        title: "Writing Effective Memorandums (Memos)",
        description: "Internal organizational documents communicating directives, policy changes, or brief status reports.",
        keyPoints: [
          "Header format: To, From, Date, Subject",
          "Direct vs Indirect organizational strategy based on reader receptivity",
          "Call-to-action closing with explicit points of contact"
        ]
      },
      {
        title: "Minutes of the Meeting (MoM)",
        description: "Legal and operational records summarizing discussions, quorum, resolutions, and accountability timelines.",
        keyPoints: [
          "Action-item assignment matrix",
          "Formal motion recording and voting tallies",
          "Archival requirements and sign-off protocols"
        ]
      }
    ]
  }
];
