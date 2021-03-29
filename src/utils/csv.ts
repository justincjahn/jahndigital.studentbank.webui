/* eslint-disable no-continue */

// Represents an individual line of a CSV
export type CSVItem<T> = { [index in keyof T]: string }

// CSV Options
export interface CSVOpts {
  header?: boolean;
  delimiter?: string;
  qualifier?: string;
}

/**
 * Parse a single line of a CSV file.
 *
 * @param line The line to parse.
 * @param delimiter Column delimiter, usually a comma.
 * @param qualifier For values containing the delimiter, it can be encapsulated in this.  Usually a double-quote.
 * @returns An array of strings.
 */
export function parseCSVLine(
  line: string,
  delimiter = ',',
  qualifier = '"',
): string[] {
  const parsed = new Array<string>();
  const chars = line.split('');

  let buffer = '';
  let encapsulated = false;

  for (let i = 0; i < chars.length; i += 1) {
    const current = chars[i];

    if (current === qualifier) {
      encapsulated = !encapsulated;
      continue;
    }

    if ((current === delimiter && !encapsulated) || line.length === (i + 1)) {
      // Last character in the line, but the encapsulation was never closed
      if (line.length === (i + 1)) {
        buffer += current;
      }

      parsed.push(buffer);
      buffer = '';
      continue;
    }

    buffer += current;
  }

  return parsed;
}

/**
 * Parse a CSV into an array of objects.
 *
 * @param file The string to parse.
 * @param header If there is a header in the provided string, or if numeric indicies should be used.
 * @param delimiter Column delimiter, usually a comma.
 * @param qualifier For values containing the delimiter, it can be encapsulated in this.  Usually a double-quote.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCSV<THeaders extends any>(
  file: string,
  opts: CSVOpts = {},
): Array<CSVItem<THeaders>> {
  let headers = new Array<string>();
  const parsed = new Array<CSVItem<THeaders>>();

  const options = {
    header: true,
    delimiter: ',',
    qualifier: '"',
    ...opts,
  };

  const sanitized = file.replace('\r\n', '\n').replace('\n\n', '\n');
  const lines = sanitized.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    // Skip empty lines
    if (lines[i].trim().length === 0) continue;

    const values = parseCSVLine(lines[i], options.delimiter, options.qualifier);

    // Set string headings or generate numeric headings
    if (options.header && i === 0) {
      headers = values;
      continue;
    } else if (!options.header && i === 0) {
      for (let heading = 0; heading < values.length; heading += 1) {
        headers.push(heading.toString());
      }
    }

    const dict = {} as CSVItem<THeaders>;
    for (let index = 0; index < values.length; index += 1) {
      const heading = headers[index] as keyof THeaders;
      dict[heading] = values[index];
    }

    parsed.push(dict);
  }

  return parsed;
}
