#!/usr/bin/env node
/* eslint-disable no-continue */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

/**
 * Parse a single line of a CSV file.
 *
 * @param {string} line The line to parse.
 * @param {string=} delimiter Column delimiter, usually a comma.
 * @param {string=} qualifier For values containing the delimiter, it can be encapsulated in this.  Usually a double-quote.
 * @returns {string[]} An array of strings.
 */
function parseCSVLine(
  line,
  delimiter = ',',
  qualifier = '"',
) {
  const parsed = [];
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
      if (line.length === (i + 1) && current !== delimiter) {
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
 * @param {string} file The string to parse.
 * @param {object} opts options
 * @param {boolean} opts.header If there is a header in the provided string, or if numeric indices should be used.
 * @param {string} opts.delimiter Column delimiter, usually a comma.
 * @param {string} opts.qualifier For values containing the delimiter, it can be encapsulated in this.  Usually a double-quote.
 * @returns {Array.<Object.<(string|number), string>>} An array of rows containing an array of strings for each column in the file.
 */
function parseCSV(
  file,
  opts = {},
) {
  let headers = [];
  const parsed = [];

  const options = {
    header: true,
    delimiter: ',',
    qualifier: '"',
    ...opts,
  };

  const sanitized = file.replace(/[\r\n]+/g, '\n');
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

    const dict = {};
    for (let index = 0; index < values.length; index += 1) {
      const heading = headers[index];
      dict[heading] = values[index];
    }

    parsed.push(dict);
  }

  return parsed;
}

/**
 * Split a name in the format 'Last Name, First Name I.' where middle initial is optional into an array of components.
 *
 * @param {string} name The raw name in the format 'Last Name, First Name I.' where middle initial is optional
 * @returns {string[]} An array of three strings- last name, first name, middle initial (which may be empty)
 */
function parseName(name) {
  let initial = '';

  if (name[name.length - 1] === '.') {
    initial = name.substring(name.length - 2, 2);
  }

  const firstLast = name.split(',');

  let firstName = firstLast[1].trim();
  if (initial.length > 0) {
    // Remove initial from last name
    firstName = firstName.substring(0, firstName.length - 3);
  }

  return [
    firstLast[0],
    firstName,
    initial,
  ];
}

const sourceFile = process.argv[2] || null;
if (sourceFile === null) {
  console.log('Usage: synergy-extract.js /path/to/source.csv');
  process.exit(1);
}

try {
  fs.accessSync(sourceFile, fs.constants.R_OK);
} catch {
  console.error(`File '${sourceFile}' does not exist or you do not have permission to read it.`);
  process.exit(1);
}

let sourceDataRaw = '';
try {
  sourceDataRaw = fs.readFileSync(sourceFile, 'utf-8');
} catch (e) {
  console.error(`Unable to read file '${sourceFile}': ${e?.message ?? e}`);
  process.exit(1);
}

const sourceData = parseCSV(sourceDataRaw);
let output = 'group,account_number,first_name,last_name,email\n';
sourceData.forEach((row) => {
  const period = row.Period;
  const accountNumber = row['Perm ID'];
  const [lastName, firstName] = parseName(row['Student Name']);
  output += `"Period ${period}","${accountNumber}","${firstName}","${lastName}",\n`;
});

console.log(output);
