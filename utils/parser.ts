import { Quiz, Question, Option } from '../types';

export const parseQuizFile = (content: string, fileName: string): Quiz => {
  const lines = content.split('\n');
  
  // 1. Extract Title (### **TITLE**)
  const titleRegex = /### \*\*(.*?)\*\*/;
  const titleMatch = content.match(titleRegex);
  const title = titleMatch ? titleMatch[1].trim() : fileName.replace('.txt', '');

  const questions: Question[] = [];
  
  // We will split the content by the Question marker `**Câu`
  // However, since we need to process line by line for options, let's use a state machine approach or block splitting.
  
  // Split by the start of a question block
  const rawBlocks = content.split(/\*\*Câu/g);
  
  // skip the first block if it's just header info (before the first question)
  const questionBlocks = rawBlocks.slice(1); 

  questionBlocks.forEach((block, index) => {
    // Re-add the split token to parse correctly if needed, or just parse the inner content
    const fullBlock = `Câu${block}`; // Reconstruct "Câu..."
    
    // Regex to extract Question Text:  "Câu i: abcxyz**" or "Câu i: (Type) abcxyz**"
    // It looks for the colon, then content until the closing **
    const questionTextRegex = /Câu.*?:(.*?)\*\*/s;
    const qTextMatch = fullBlock.match(questionTextRegex);
    
    // Regex to extract Correct Answer: "**Đáp án đúng: B**"
    const answerRegex = /\*\*Đáp án đúng:\s*([A-D])\*\*/;
    const ansMatch = fullBlock.match(answerRegex);

    if (qTextMatch && ansMatch) {
      const questionText = qTextMatch[1].trim();
      const correctAnswer = ansMatch[1].trim();

      // Extract Options
      // Strategy: Look for lines starting with A., B., C., D. between the question end and answer start
      // We get the substring between the end of Question Text match and start of Answer match
      const qEndIndex = (qTextMatch.index || 0) + qTextMatch[0].length;
      const aStartIndex = (ansMatch.index || 0);
      
      const optionsBlock = fullBlock.substring(qEndIndex, aStartIndex);
      const optionsLines = optionsBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      const options: Option[] = [];
      
      optionsLines.forEach(line => {
        // Match "A. Content" or "A.Content"
        const optMatch = line.match(/^([A-D])\.\s*(.*)/);
        if (optMatch) {
          options.push({
            label: optMatch[1],
            content: optMatch[2]
          });
        }
      });

      questions.push({
        id: index + 1,
        text: questionText,
        options,
        correctAnswer
      });
    }
  });

  return {
    id: Date.now().toString(), // simple ID
    title,
    fileName,
    questions
  };
};