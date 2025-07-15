# Document Types Configuration Guide

This document analysis app supports multiple document types through JSON configuration files. You can easily add new document types by creating a configuration file that defines how the app should analyze and extract information from your specific document type.

## Overview

Each document type is defined by a JSON configuration file that specifies:
- Document metadata (type, display name)
- Analysis sections and their prompts
- Specific topics to extract within each section
- Custom extraction logic for different document structures

## Configuration File Structure

### Basic Structure

```json
{
  "type": "document_type_key",
  "displayName": "Human Readable Name",
  "sections": [
    {
      "key": "section_key",
      "label": "Section Display Name",
      "prompt": "Instructions for analyzing this section",
      "topics": [
        {
          "key": "topic_key",
          "label": "Topic Display Name",
          "prompt": "Specific question or instruction for this topic"
        }
      ]
    }
  ]
}
```

### Required Fields

- **`type`**: Unique identifier for the document type (use lowercase, underscores for spaces)
- **`displayName`**: Human-readable name shown in the UI
- **`sections`**: Array of analysis sections

### Section Structure

Each section in the `sections` array can have:

- **`key`**: Unique identifier for the section
- **`label`**: Display name for the section
- **`prompt`**: Instructions for the AI on how to analyze this section
- **`topics`** (optional): Array of specific topics to extract within this section

#### Special Section: Summary

The "summary" section is a special type that supports multiple topics for structured information extraction. When using a summary section:

- Use `"key": "summary"` to enable special handling
- Include multiple topics in the `topics` array
- Each topic will be extracted as a separate field
- This is ideal for extracting structured metadata from documents

### Topic Structure

Each topic in the `topics` array should have:

- **`key`**: Unique identifier for the topic
- **`label`**: Display name for the topic
- **`prompt`**: Specific question or instruction for extracting this information

## Examples

### Example 1: Contract Analysis

```json
{
  "type": "contract",
  "displayName": "Contract",
  "sections": [
    {
      "key": "summary",
      "label": "Summary",
      "prompt": "Extract the following key details from the contract, citing page numbers for each:",
      "topics": [
        {
          "key": "contractTitle",
          "label": "Contract Title",
          "prompt": "What is the title or name of this contract?"
        },
        {
          "key": "contractNumber",
          "label": "Contract Number",
          "prompt": "What is the contract number or reference ID?"
        },
        {
          "key": "effectiveDate",
          "label": "Effective Date",
          "prompt": "What is the effective date of the contract?"
        },
        {
          "key": "expirationDate",
          "label": "Expiration Date",
          "prompt": "What is the expiration or termination date?"
        },
        {
          "key": "contractValue",
          "label": "Contract Value",
          "prompt": "What is the total contract value or amount?"
        },
        {
          "key": "paymentTerms",
          "label": "Payment Terms",
          "prompt": "What are the payment terms and schedule?"
        }
      ]
    },
    {
      "key": "parties",
      "label": "Parties Involved",
      "prompt": "Identify all parties involved in this contract, citing page numbers:"
    },
    {
      "key": "terms",
      "label": "Key Terms",
      "prompt": "Extract the key contractual terms and conditions. Provide page numbers for each term."
    },
    {
      "key": "obligations",
      "label": "Obligations",
      "prompt": "List the obligations of each party. Include page references."
    }
  ]
}
```

### Example 2: Research Paper Analysis

```json
{
  "type": "research_paper",
  "displayName": "Research Paper",
  "sections": [
    {
      "key": "summary",
      "label": "Summary",
      "prompt": "Extract the following key details from the research paper, citing page numbers for each:",
      "topics": [
        {
          "key": "title",
          "label": "Title",
          "prompt": "What is the title of the paper?"
        },
        {
          "key": "authors",
          "label": "Authors",
          "prompt": "Who are the authors and their affiliations?"
        },
        {
          "key": "publicationDate",
          "label": "Publication Date",
          "prompt": "What is the publication date or submission date?"
        },
        {
          "key": "journal",
          "label": "Journal/Conference",
          "prompt": "What journal or conference is this published in?"
        },
        {
          "key": "keywords",
          "label": "Keywords",
          "prompt": "What are the key terms or keywords?"
        },
        {
          "key": "researchArea",
          "label": "Research Area",
          "prompt": "What is the primary research area or field?"
        }
      ]
    },
    {
      "key": "abstract",
      "label": "Abstract",
      "prompt": "Extract the complete abstract or summary of the paper. Include page numbers."
    },
    {
      "key": "methodology",
      "label": "Methodology",
      "prompt": "Describe the research methodology used in this paper. Include page numbers."
    },
    {
      "key": "findings",
      "label": "Key Findings",
      "prompt": "Summarize the main findings and conclusions. Reference specific pages."
    }
  ]
}
```

## Best Practices

### 1. Clear and Specific Prompts

Write prompts that are:
- Specific about what information to extract
- Clear about the expected format
- Include requests for page numbers or citations when relevant

**Good**: "What is the submission deadline? Include the specific date and time."
**Better**: "What is the submission deadline? Provide the exact date, time, and time zone if specified."

### 2. Use Summary Section for Structured Data

The summary section is special and should be used for extracting structured metadata:

```json
{
  "key": "summary",
  "label": "Summary", 
  "prompt": "Extract the following key details from the document, citing page numbers for each:",
  "topics": [
    {
      "key": "documentTitle",
      "label": "Document Title",
      "prompt": "What is the title of this document?"
    },
    {
      "key": "documentDate",
      "label": "Document Date", 
      "prompt": "What is the date of this document?"
    }
  ]
}
```

Use regular sections for broader analysis:

```json
{
  "key": "analysis",
  "label": "Analysis",
  "prompt": "Analyze the content and provide insights. Include page references."
}
```

### 3. Consistent Naming Conventions

- Use descriptive but concise keys
- Use camelCase for keys (e.g., `submissionDeadline`)
- Use Title Case for labels (e.g., "Submission Deadline")

### 4. Page Reference Requirements

Always include instructions for page references in your prompts:
- "Provide the relevant page numbers"
- "Cite page numbers for each item"
- "Include page references"

### 5. Handle Optional Information

For information that might not be present in all documents:
- Use conditional language: "If available, what is..."
- Provide fallback instructions: "If not specified, indicate 'Not mentioned'"

## Adding Your Document Type

1. **Create the JSON file**: Name it `[document_type].json` (e.g., `contract.json`)

2. **Place in the config directory**: Save the file in the appropriate configuration directory

3. **Test with sample documents**: Ensure your configuration works with typical documents of this type

4. **Refine prompts**: Adjust prompts based on the quality of extracted information

## Common Document Types to Consider

- **Legal Documents**: Contracts, agreements, legal briefs
- **Financial Documents**: Financial statements, audit reports, budgets
- **Technical Documents**: Specifications, manuals, technical reports
- **Academic Documents**: Research papers, theses, grant applications
- **Business Documents**: Proposals, business plans, meeting minutes
- **Government Documents**: Regulations, policy documents, public notices

## Troubleshooting

### Information Not Being Extracted

- Check if your prompts are specific enough
- Verify that the section/topic structure matches your document type
- Ensure page reference instructions are included

### Inconsistent Results

- Make prompts more specific and detailed
- Add examples in the prompt when helpful
- Consider breaking complex topics into smaller, more focused topics

### Missing Sections

- Verify your JSON syntax is correct
- Check that all required fields are present
- Ensure section and topic keys are unique

## File Naming and Location

- Use lowercase with underscores: `research_paper.json`
- Keep names descriptive but concise
- Place files in the designated config directory
- Use the same name for the file and the `type` field

## Support

For questions about creating document type configurations:
1. Review the existing RFP example
2. Test with sample documents
3. Iterate on prompts based on results
4. Consider the specific needs of your document type

Remember: The goal is to create configurations that consistently extract the most important information from your document type while maintaining accuracy and completeness.