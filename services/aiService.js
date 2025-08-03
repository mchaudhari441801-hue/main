const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateEducationalParagraph(transcript, videoTitle, imageCount) {
    try {
      const prompt = this.createPrompt(transcript, videoTitle, imageCount);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an educational content creator who specializes in creating comprehensive, well-structured paragraphs from video transcripts. You excel at incorporating visual references naturally into educational content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const generatedText = completion.choices[0].message.content;
      return this.processGeneratedText(generatedText, imageCount);
    } catch (error) {
      console.error('Error generating paragraph:', error);
      throw new Error('Failed to generate educational paragraph');
    }
  }

  createPrompt(transcript, videoTitle, imageCount) {
    return `
Based on the following video transcript from "${videoTitle}", create a comprehensive educational paragraph that:

1. Summarizes the key educational concepts and information
2. Maintains academic tone and structure
3. Includes exactly ${imageCount} reference numbers [1], [2], [3], etc. naturally integrated into the text
4. Each reference should correspond to a visual element or concept that would benefit from an image
5. Make the references feel natural and educational, not forced
6. Keep the paragraph between 200-400 words
7. Focus on the most important educational content

Transcript:
${transcript}

Please generate the educational paragraph with numbered references [1], [2], [3], etc. integrated naturally into the content.
    `;
  }

  processGeneratedText(text, imageCount) {
    // Ensure we have the right number of references
    const references = [];
    let processedText = text;

    // Extract existing references and clean them up
    const referenceRegex = /\[(\d+)\]/g;
    let match;
    const foundReferences = new Set();

    while ((match = referenceRegex.exec(text)) !== null) {
      foundReferences.add(parseInt(match[1]));
    }

    // If we don't have enough references, add them strategically
    if (foundReferences.size < imageCount) {
      const sentences = processedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentenceCount = sentences.length;
      const interval = Math.floor(sentenceCount / imageCount);

      let referenceNumber = 1;
      let newText = '';
      
      for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i].trim();
        
        if (i > 0 && i % interval === 0 && referenceNumber <= imageCount) {
          // Add reference at the end of strategic sentences
          if (!sentence.match(/\[\d+\]/)) {
            sentence += ` [${referenceNumber}]`;
            referenceNumber++;
          }
        }
        
        newText += sentence + (i < sentences.length - 1 ? '. ' : '.');
      }
      
      processedText = newText;
    }

    // Extract final references for database
    const finalReferenceRegex = /\[(\d+)\]/g;
    let finalMatch;
    
    while ((finalMatch = finalReferenceRegex.exec(processedText)) !== null) {
      references.push({
        number: parseInt(finalMatch[1]),
        description: this.getContextForReference(processedText, finalMatch.index)
      });
    }

    return {
      paragraph: processedText,
      references: references
    };
  }

  getContextForReference(text, referenceIndex) {
    // Get surrounding context for the reference
    const start = Math.max(0, referenceIndex - 100);
    const end = Math.min(text.length, referenceIndex + 100);
    const context = text.substring(start, end);
    
    // Extract the sentence containing the reference
    const sentences = context.split(/[.!?]+/);
    const referenceSentence = sentences.find(s => s.includes('['));
    
    return referenceSentence ? referenceSentence.trim() : 'Visual reference';
  }

  async generateImageDescription(transcript, referenceContext) {
    try {
      const prompt = `
Based on this educational content: "${referenceContext}"
From the full transcript context, suggest what type of educational image or diagram would be most helpful here.
Keep it brief (1-2 sentences) and educational.

Full context: ${transcript.substring(0, 500)}...
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.5
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating image description:', error);
      return 'Educational visual reference';
    }
  }
}

module.exports = new AIService();