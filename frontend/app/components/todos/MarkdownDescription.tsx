import type { ReactNode } from 'react';

interface MarkdownDescriptionProps {
  markdown: string;
}

const inlineTokenPattern =
  /(`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|\*[^*\n]+\*|_[^_\n]+_)/g;

function getSafeHref(href: string): string | null {
  if (href.startsWith('/') || href.startsWith('#')) {
    return href;
  }

  try {
    const url = new URL(href);

    if (
      url.protocol === 'http:' ||
      url.protocol === 'https:' ||
      url.protocol === 'mailto:'
    ) {
      return href;
    }
  } catch {
    return null;
  }

  return null;
}

function renderInlineMarkdown(
  text: string,
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(inlineTokenPattern)) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      nodes.push(
        <span key={`${keyPrefix}-text-${tokenIndex}`}>
          {text.slice(lastIndex, matchIndex)}
        </span>,
      );
    }

    const token = match[0];
    const key = `${keyPrefix}-token-${tokenIndex}`;

    if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(
        /^\[([^\]]+)\]\(([^)\s]+)\)$/,
      );

      if (linkMatch) {
        const [, label, href] = linkMatch;
        const safeHref = getSafeHref(href);

        if (safeHref) {
          const isExternal =
            safeHref.startsWith('http://') ||
            safeHref.startsWith('https://');

          nodes.push(
            <a
              key={key}
              href={safeHref}
              {...(isExternal
                ? {
                  target: '_blank',
                  rel: 'noreferrer noopener',
                }
                : {})}
            >
              {renderInlineMarkdown(label, `${key}-label`)}
            </a>,
          );
        } else {
          nodes.push(<span key={key}>{label}</span>);
        }
      }
    } else if (
      token.startsWith('**') ||
      token.startsWith('__')
    ) {
      nodes.push(
        <strong key={key}>
          {renderInlineMarkdown(
            token.slice(2, -2),
            `${key}-strong`,
          )}
        </strong>,
      );
    } else if (token.startsWith('~~')) {
      nodes.push(
        <del key={key}>
          {renderInlineMarkdown(
            token.slice(2, -2),
            `${key}-del`,
          )}
        </del>,
      );
    } else {
      nodes.push(
        <em key={key}>
          {renderInlineMarkdown(
            token.slice(1, -1),
            `${key}-em`,
          )}
        </em>,
      );
    }

    lastIndex = matchIndex + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <span key={`${keyPrefix}-text-${tokenIndex}`}>
        {text.slice(lastIndex)}
      </span>,
    );
  }

  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  const cells = parseTableRow(line);

  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function isBlockStart(line: string): boolean {
  return (
    /^```/.test(line) ||
    /^#{1,6}\s/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*+]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)
  );
}

export function MarkdownDescription({
  markdown,
}: MarkdownDescriptionProps) {
  if (!markdown.trim()) {
    return (
      <p className="markdown-empty">
        Описание не добавлено.
      </p>
    );
  }

  const lines = markdown
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const blocks: ReactNode[] = [];

  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    if (!line.trim()) {
      lineIndex += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([\w+-]*)\s*$/);

    if (fenceMatch) {
      const codeLines: string[] = [];
      const blockKey = `code-${lineIndex}`;
      const language = fenceMatch[1];

      lineIndex += 1;

      while (
        lineIndex < lines.length &&
        !/^```\s*$/.test(lines[lineIndex])
      ) {
        codeLines.push(lines[lineIndex]);
        lineIndex += 1;
      }

      if (lineIndex < lines.length) {
        lineIndex += 1;
      }

      blocks.push(
        <pre key={blockKey}>
          <code
            className={
              language ? `language-${language}` : undefined
            }
          >
            {codeLines.join('\n')}
          </code>
        </pre>,
      );

      continue;
    }

    if (
      lineIndex + 1 < lines.length &&
      line.includes('|') &&
      isTableDivider(lines[lineIndex + 1])
    ) {
      const tableStart = lineIndex;
      const headers = parseTableRow(line);
      const rows: string[][] = [];

      lineIndex += 2;

      while (
        lineIndex < lines.length &&
        lines[lineIndex].trim() &&
        lines[lineIndex].includes('|')
      ) {
        rows.push(parseTableRow(lines[lineIndex]));
        lineIndex += 1;
      }

      blocks.push(
        <div
          className="markdown-table-wrapper"
          key={`table-${tableStart}`}
          tabIndex={0}
          role="region"
          aria-label="Таблица в описании задачи"
        >
          <table>
            <thead>
              <tr>
                {headers.map((header, cellIndex) => (
                  <th key={`table-${tableStart}-head-${cellIndex}`}>
                    {renderInlineMarkdown(
                      header,
                      `table-${tableStart}-head-${cellIndex}`,
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`table-${tableStart}-row-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td
                      key={`table-${tableStart}-cell-${rowIndex}-${cellIndex}`}
                    >
                      {renderInlineMarkdown(
                        row[cellIndex] ?? '',
                        `table-${tableStart}-cell-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );

      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingContent = renderInlineMarkdown(
        headingMatch[2],
        `heading-${lineIndex}`,
      );

      if (headingLevel === 1) {
        blocks.push(<h1 key={`heading-${lineIndex}`}>{headingContent}</h1>);
      } else if (headingLevel === 2) {
        blocks.push(<h2 key={`heading-${lineIndex}`}>{headingContent}</h2>);
      } else if (headingLevel === 3) {
        blocks.push(<h3 key={`heading-${lineIndex}`}>{headingContent}</h3>);
      } else if (headingLevel === 4) {
        blocks.push(<h4 key={`heading-${lineIndex}`}>{headingContent}</h4>);
      } else if (headingLevel === 5) {
        blocks.push(<h5 key={`heading-${lineIndex}`}>{headingContent}</h5>);
      } else {
        blocks.push(<h6 key={`heading-${lineIndex}`}>{headingContent}</h6>);
      }

      lineIndex += 1;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: ReactNode[] = [];
      const listStart = lineIndex;

      while (
        lineIndex < lines.length &&
        /^[-*+]\s+/.test(lines[lineIndex])
      ) {
        const itemText = lines[lineIndex].replace(
          /^[-*+]\s+/,
          '',
        );

        items.push(
          <li key={`unordered-${lineIndex}`}>
            {renderInlineMarkdown(
              itemText,
              `unordered-${lineIndex}`,
            )}
          </li>,
        );
        lineIndex += 1;
      }

      blocks.push(<ul key={`list-${listStart}`}>{items}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: ReactNode[] = [];
      const listStart = lineIndex;

      while (
        lineIndex < lines.length &&
        /^\d+\.\s+/.test(lines[lineIndex])
      ) {
        const itemText = lines[lineIndex].replace(
          /^\d+\.\s+/,
          '',
        );

        items.push(
          <li key={`ordered-${lineIndex}`}>
            {renderInlineMarkdown(
              itemText,
              `ordered-${lineIndex}`,
            )}
          </li>,
        );
        lineIndex += 1;
      }

      blocks.push(<ol key={`list-${listStart}`}>{items}</ol>);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteStart = lineIndex;
      const quoteLines: string[] = [];

      while (
        lineIndex < lines.length &&
        /^>\s?/.test(lines[lineIndex])
      ) {
        quoteLines.push(
          lines[lineIndex].replace(/^>\s?/, ''),
        );
        lineIndex += 1;
      }

      blocks.push(
        <blockquote key={`quote-${quoteStart}`}>
          {renderInlineMarkdown(
            quoteLines.join(' '),
            `quote-${quoteStart}`,
          )}
        </blockquote>,
      );
      continue;
    }

    if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push(<hr key={`rule-${lineIndex}`} />);
      lineIndex += 1;
      continue;
    }

    const paragraphStart = lineIndex;
    const paragraphLines: string[] = [];

    while (
      lineIndex < lines.length &&
      lines[lineIndex].trim() &&
      (lineIndex === paragraphStart ||
        !isBlockStart(lines[lineIndex]))
    ) {
      paragraphLines.push(lines[lineIndex]);
      lineIndex += 1;
    }

    blocks.push(
      <p key={`paragraph-${paragraphStart}`}>
        {renderInlineMarkdown(
          paragraphLines.join(' '),
          `paragraph-${paragraphStart}`,
        )}
      </p>,
    );
  }

  return <div className="markdown-content">{blocks}</div>;
}
