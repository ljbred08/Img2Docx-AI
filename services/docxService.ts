
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, BorderStyle } from "docx";
import { lexer, Tokens } from "marked";

/**
 * A robust Markdown to DOCX converter.
 * It uses the 'marked' lexer to tokenize markdown and then maps these tokens 
 * to 'docx' elements, ensuring support for nested formatting, lists, and headers.
 */
export const generateDocx = async (
  markdownPages: string[], 
  options: { includePageBreaks: boolean } = { includePageBreaks: true }
): Promise<Blob> => {
  const children: any[] = [];

  const parseInlineTokens = (tokens: any[]): TextRun[] => {
    const runs: TextRun[] = [];
    
    const processToken = (token: any, style: { bold?: boolean; italic?: boolean } = {}) => {
      if (token.type === 'text') {
        runs.push(new TextRun({ text: token.text, ...style }));
      } else if (token.type === 'strong') {
        token.tokens?.forEach((t: any) => processToken(t, { ...style, bold: true }));
      } else if (token.type === 'em') {
        token.tokens?.forEach((t: any) => processToken(t, { ...style, italic: true }));
      } else if (token.type === 'codespan') {
        runs.push(new TextRun({ text: token.text, ...style, font: "Courier New", shading: { fill: "F0F0F0" } }));
      } else if (token.type === 'br') {
        runs.push(new TextRun({ text: "", break: 1 }));
      }
    };

    tokens.forEach(t => processToken(t));
    return runs;
  };

  const processTokens = (tokens: any[]) => {
    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading': {
          // Use type inference to avoid 'HeadingLevel refers to a value but is being used as a type' error
          let level: any = HeadingLevel.HEADING_1;
          if (token.depth === 2) level = HeadingLevel.HEADING_2;
          if (token.depth >= 3) level = HeadingLevel.HEADING_3;
          
          children.push(new Paragraph({
            children: parseInlineTokens(token.tokens),
            heading: level,
            spacing: { before: 240, after: 120 },
          }));
          break;
        }

        case 'paragraph': {
          children.push(new Paragraph({
            children: parseInlineTokens(token.tokens),
            spacing: { after: 120 },
          }));
          break;
        }

        case 'list': {
          token.items.forEach((item: any, index: number) => {
            const firstToken = item.tokens[0];
            if (firstToken && firstToken.type === 'text') {
               children.push(new Paragraph({
                children: parseInlineTokens(firstToken.tokens || []),
                bullet: {
                  level: 0,
                },
                spacing: { after: 60 },
              }));
            } else if (firstToken && firstToken.type === 'paragraph') {
               children.push(new Paragraph({
                children: parseInlineTokens(firstToken.tokens),
                bullet: {
                  level: 0,
                },
                spacing: { after: 60 },
              }));
            }
          });
          break;
        }

        case 'hr': {
          children.push(new Paragraph({
            border: {
              bottom: {
                color: "auto",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 240, after: 240 },
          }));
          break;
        }

        case 'space':
          break;

        default:
          if (token.text) {
             children.push(new Paragraph({ text: token.text, spacing: { after: 120 } }));
          }
          break;
      }
    });
  };

  markdownPages.forEach((pageMd, pageIndex) => {
    const tokens = lexer(pageMd);
    processTokens(tokens);

    // Page break after each image's content if enabled (except the last one)
    if (options.includePageBreaks && pageIndex < markdownPages.length - 1) {
      children.push(new Paragraph({
        children: [new TextRun({ text: "", break: 1 })], 
        pageBreakBefore: true, 
      }));
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
           page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};
