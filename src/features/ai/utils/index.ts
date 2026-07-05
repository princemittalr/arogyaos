// AI utilities index
export const aiHelpers = {
  cleanJsonMarkdown: (text: string): string => {
    // Strip markdown code blocks (e.g. ```json ... ```) to extract raw JSON
    return text.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
  },
};
export default aiHelpers;
