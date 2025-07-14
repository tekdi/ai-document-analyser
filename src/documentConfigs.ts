export type SummaryTopic = {
  key: string;
  label: string;
  prompt: string;
};

export type SectionConfig = {
  key: string;
  label: string;
  prompt: string;
  topics?: SummaryTopic[]; // Only for summary section
};

export type DocumentTypeConfig = {
  type: string;
  displayName: string;
  sections: SectionConfig[];
};

export const documentTypes: DocumentTypeConfig[] = [
  {
    type: 'rfp',
    displayName: 'RFP',
    sections: [
      {
        key: 'summary',
        label: 'Summary',
        prompt: 'Extract the following key details from the RFP, citing page numbers for each:',
        topics: [
          { key: 'tenderName', label: 'Tender Name', prompt: 'What is the Tender Name?' },
          { key: 'issuingAuthority', label: 'Issuing Authority', prompt: 'Who is the Issuing Authority?' },
          { key: 'tenderReferenceNumber', label: 'Tender Reference Number', prompt: 'What is the Tender Reference Number?' },
          { key: 'keyDates', label: 'Key Dates', prompt: 'List all important dates like submission deadline, pre-bid meeting, etc.' },
          { key: 'eligibilityCriteria', label: 'Eligibility Criteria', prompt: 'What are the eligibility criteria?' },
          { key: 'commercialModel', label: 'Commercial Model', prompt: 'What is the commercial model?' },
          { key: 'emdOrBankGuarantee', label: 'EMD or Bank Guarantee', prompt: 'What is the EMD or Bank Guarantee requirement?' },
          { key: 'exemptionsForMSME', label: 'Exemptions for MSME', prompt: 'Are there any exemptions for MSME?' },
          { key: 'subcontractingAllowed', label: 'Subcontracting Allowed', prompt: 'Is subcontracting allowed?' },
          { key: 'consortiumAllowed', label: 'Consortium Allowed', prompt: 'Is consortium allowed?' },
          { key: 'minimumKeyStaff', label: 'Minimum Key Staff / Roles', prompt: 'What are the minimum key staff/roles required?' },
          { key: 'locationOfWork', label: 'Location of Work', prompt: 'What is the location of work?' },
        ]
      },
      { key: 'scopeOfWork', label: 'Scope of Work', prompt: 'Describe the scope of work. Provide the relevant page numbers.' },
      { key: 'penalties', label: 'Penalties & Risks', prompt: 'Extract all penalty, SLA, liquidated damages, commercial risk and other risk clauses. Separate each citation with a new line.' },
      { key: 'scoringCriteria', label: 'Scoring Criteria', prompt: 'Extract the scoring or evaluation criteria. If in a table, recreate as markdown. Provide page numbers.' },
    ],
  },
  {
    type: 'legal',
    displayName: 'Legal Document',
    sections: [
      {
        key: 'summary',
        label: 'Summary',
        prompt: 'Extract the following key details from the legal document, citing page numbers for each:',
        topics: [
          { key: 'caseName', label: 'Case Name', prompt: 'What is the case name?' },
          { key: 'parties', label: 'Parties Involved', prompt: 'Who are the parties involved?' },
          { key: 'dateOfAgreement', label: 'Date of Agreement', prompt: 'What is the date of agreement?' },
        ]
      },
      { key: 'obligations', label: 'Obligations', prompt: 'Summarize the obligations.' },
      { key: 'termination', label: 'Termination Clauses', prompt: 'Extract all termination clauses.' },
    ],
  },
];