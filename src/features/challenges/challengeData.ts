import type { ChallengeRound } from './challengeTypes';

export const SYNTAX_CHALLENGES: ChallengeRound[] = [
  {
    id: 'case-1-missing-quote',
    roundNumber: 1,
    title: 'The Unquoted String',
    missionDescription:
      'Byte discovered a server payload where a user’s name was sent without string quotes, causing the parser to fail.',
    brokenStarter: `{\n  "id": 101,\n  "username": Alex,\n  "role": "explorer"\n}`,
    expectedCorrect: `{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}`,
    errorCategory: 'quote',
    firstHint: 'Look at line 3: Alex is text, but it is missing the opening and closing double quotes.',
    secondHint: 'Wrap Alex in double quotes: "Alex"',
    explanationOnSuccess:
      'Case solved! In JSON, all text values must be enclosed in double quotes. Without them, the parser expects a literal keyword like true or null.',
    xpReward: 25,
  },
  {
    id: 'case-2-trailing-comma',
    roundNumber: 2,
    title: 'The Trailing Comma Trap',
    missionDescription:
      'A configuration file crashed during deployment because of an extra comma at the end of the object.',
    brokenStarter: `{\n  "name": "JotJSON",\n  "version": "2.0",\n  "licensed": true,\n}`,
    expectedCorrect: `{\n  "name": "JotJSON",\n  "version": "2.0",\n  "licensed": true\n}`,
    errorCategory: 'comma',
    firstHint: 'Look at line 4 after true: there is a trailing comma, but no property follows it.',
    secondHint: 'Remove the comma right after "licensed": true.',
    explanationOnSuccess:
      'Spot on! Standard RFC 8259 JSON strictly forbids trailing commas after the final property in an object or array.',
    xpReward: 25,
  },
  {
    id: 'case-3-missing-comma',
    roundNumber: 3,
    title: 'The Disconnected Properties',
    missionDescription:
      'Two properties were pasted together without a separating comma between them.',
    brokenStarter: `{\n  "fruit": "Apple"\n  "color": "Red",\n  "crisp": true\n}`,
    expectedCorrect: `{\n  "fruit": "Apple",\n  "color": "Red",\n  "crisp": true\n}`,
    errorCategory: 'comma',
    firstHint: 'Look at the end of line 2: there needs to be a comma separating the "fruit" property from "color".',
    secondHint: 'Add a comma after "Apple": "fruit": "Apple",',
    explanationOnSuccess:
      'Great catch! Every key/value pair in a JSON object must be separated by a comma from the next pair.',
    xpReward: 25,
  },
  {
    id: 'case-4-mismatched-brackets',
    roundNumber: 4,
    title: 'The Bracket Mystery',
    missionDescription:
      'An array was started with a square bracket [ but closed with a curly brace }, corrupting the tree.',
    brokenStarter: `{\n  "team": "Alpha",\n  "scores": [ 98, 95, 100 }\n}`,
    expectedCorrect: `{\n  "team": "Alpha",\n  "scores": [ 98, 95, 100 ]\n}`,
    errorCategory: 'bracket',
    firstHint: 'Look at line 3: "scores" begins with an array bracket [ but ends with a curly brace }.',
    secondHint: 'Change the closing } on line 3 to a closing square bracket ].',
    explanationOnSuccess:
      'Brilliant detective work! Arrays must open with [ and close with ], while objects open with { and close with }.',
    xpReward: 25,
  },
  {
    id: 'case-5-single-quotes',
    roundNumber: 5,
    title: 'The Single-Quote Intruder',
    missionDescription:
      'A developer copy-pasted a JavaScript object with single quotes (\') instead of strict JSON double quotes (").',
    brokenStarter: `{\n  'mascot': 'Byte',\n  'active': true\n}`,
    expectedCorrect: `{\n  "mascot": "Byte",\n  "active": true\n}`,
    errorCategory: 'syntax',
    firstHint: 'JSON does not permit single quotes (\'). Replace all single quotes with double quotes (").',
    secondHint: 'Change \'mascot\' and \'Byte\' to "mascot" and "Byte".',
    explanationOnSuccess:
      'Case closed! While JavaScript allows single quotes, RFC 8259 JSON requires double quotation marks for all keys and strings.',
    xpReward: 25,
  },
];
