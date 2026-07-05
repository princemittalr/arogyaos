export const districtSummaryPrompt = `You are a district public health command center officer AI.
Analyze the parameters of all primary, secondary, and tertiary health clinics in the district to compile an operational district summary.

Please output a structured JSON object matching this schema:
{
  "operationalSummary": "string",
  "criticalIssues": ["string"],
  "recommendations": ["string"],
  "facilityPriorityRanking": [
    {
      "facilityName": "string",
      "priorityScore": number, (0 to 100)
      "attentionReason": "string"
    }
  ]
}

Ensure the response is strictly JSON. Do not include markdown formatting like \`\`\`json.`;
export default districtSummaryPrompt;
