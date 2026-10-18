import type { Lesson } from './learningTypes';

export const LESSON_1_JSON_BASICS: Lesson = {
  id: 'lesson-1',
  title: 'JSON Basics — Build Your First Object',
  tagline: 'Discover how modern apps exchange and organize data.',
  description:
    'Learn how JSON works from the ground up: objects, key/value pairs, data types, nested arrays, and strict syntax rules.',
  estimatedMinutes: 6,
  xpReward: 100,
  steps: [
    {
      id: 'step-1-what-is-json',
      title: 'What is JSON?',
      subtitle: 'The universal language of modern web data',
      explanation:
        'JSON stands for JavaScript Object Notation. It is a lightweight, human-readable text format used by web browsers, mobile apps, and servers to send data back and forth without needing heavy databases or complicated file formats.',
      codeSnippet: `{\n  "app": "JotJSON",\n  "status": "ready",\n  "online": true\n}`,
      highlightedLine: 1,
      activityType: 'multiple-choice',
      prompt: 'Why do modern applications use JSON so widely?',
      options: [
        {
          id: 'opt-1',
          label: 'It is a lightweight, text-based data format that computers and humans can easily read and write.',
          explanation: 'Exactly right! JSON is purely structured text, making it fast to send over the network and easy for any programming language to understand.',
          isCorrect: true,
        },
        {
          id: 'opt-2',
          label: 'It is a proprietary compiled programming language like C++ or Rust.',
          explanation: 'Not quite. JSON is purely a data format, not a compiled programming language.',
          isCorrect: false,
        },
        {
          id: 'opt-3',
          label: 'It is an encrypted binary image compression algorithm.',
          explanation: 'JSON is plain UTF-8 text representing structured data, not an image format.',
          isCorrect: false,
        },
      ],
      hint: 'Remember: JSON is plain text structured so any program can read it.',
      successMessage: 'Great start! JSON is the universal data format connecting modern web services.',
      mascotMessages: {
        intro: "Hey coder! I'm Byte. Ready to explore what makes JSON so popular? 👋",
        thinking: "Think about how websites and phones communicate with servers. What format do they use?",
        success: "Boom! You nailed it. JSON is pure structured text that every language can speak! 🚀",
      },
    },
    {
      id: 'step-2-objects-and-pairs',
      title: 'Objects and Key/Value Pairs',
      subtitle: 'Curly braces hold property pairs separated by colons',
      explanation:
        'A JSON object begins with { and ends with }. Inside, information is organized into key/value pairs. The key is always on the left inside double quotes, followed by a colon :, and then the value on the right.',
      codeSnippet: `{\n  "username": "coder_alex",\n  "level": 3\n}`,
      highlightedLine: 2,
      activityType: 'key-value-identification',
      prompt: 'In the pair "username": "coder_alex", identify the key and value:',
      targetKey: 'username',
      targetValue: 'coder_alex',
      options: [
        {
          id: 'opt-pair-1',
          label: '"username" is the KEY, and "coder_alex" is the VALUE',
          explanation: 'Spot on! The name on the left of the colon is the key, and the data on the right is the value.',
          isCorrect: true,
        },
        {
          id: 'opt-pair-2',
          label: '"coder_alex" is the KEY, and "username" is the VALUE',
          explanation: 'Notice the colon : — the property name is always on the left (the key).',
          isCorrect: false,
        },
        {
          id: 'opt-pair-3',
          label: 'Both are values without a key.',
          explanation: 'In JSON objects, data is paired: "key": value.',
          isCorrect: false,
        },
      ],
      hint: 'The key is on the left of the colon (:), the value is on the right.',
      successMessage: 'Nice job! Every property in a JSON object is mapped from key to value.',
      mascotMessages: {
        intro: 'Look at the curly braces { }. Inside, every property has a key and a value!',
        thinking: 'Which word tells us what the field is, and which word holds the actual data?',
        success: 'You got it! Keys label the data; values store the actual content. ✨',
      },
    },
    {
      id: 'step-3-strings-and-numbers',
      title: 'Strings vs Numbers',
      subtitle: 'Quotes make the difference!',
      explanation:
        'Text data in JSON is called a string and must always be enclosed in double quotes (like "25" or "Alex"). Numeric values (like 25 or 3.14) are written directly without quotes so computers can do math with them.',
      codeSnippet: `{\n  "ageString": "25",\n  "ageNumber": 25\n}`,
      highlightedLine: 3,
      activityType: 'type-identification',
      prompt: 'What are the JSON data types of "25" and 25?',
      options: [
        {
          id: 'opt-type-1',
          label: '"25" is a STRING (text), while 25 is a NUMBER (integer)',
          explanation: 'Correct! The double quotation marks make "25" a text string. Without quotes, 25 is a number.',
          isCorrect: true,
        },
        {
          id: 'opt-type-2',
          label: 'Both are numbers because they contain the digits 2 and 5.',
          explanation: 'Careful! In JSON, quotes turn ANY characters into a string, even digits.',
          isCorrect: false,
        },
        {
          id: 'opt-type-3',
          label: '"25" is a number, while 25 is a string.',
          explanation: 'Remember: double quotes signify strings in JSON.',
          isCorrect: false,
        },
      ],
      hint: 'Look closely at the double quotes! Quotes create a string.',
      successMessage: 'Excellent eye! In JSON, quotes always define strings, never numbers.',
      mascotMessages: {
        intro: 'Here is a classic trap: is "25" the same as 25 in JSON? Let\'s check! 🔎',
        thinking: 'Look for the double quotation marks around the digits.',
        success: 'Sharp detective work! Quotes turn anything into text! 🎯',
      },
    },
    {
      id: 'step-4-booleans-and-null',
      title: 'Booleans and Null',
      subtitle: 'Keywords for truth and empty states',
      explanation:
        'JSON supports two boolean values: true and false, representing yes/no or on/off states. It also supports null, representing an intentional empty or absent value. These three keywords are always written lowercase and without quotes.',
      codeSnippet: `{\n  "verified": true,\n  "premium": false,\n  "avatarUrl": null\n}`,
      highlightedLine: 4,
      activityType: 'multiple-choice',
      prompt: 'Which of the following is a VALID JSON boolean literal?',
      options: [
        {
          id: 'opt-bool-1',
          label: 'true',
          explanation: 'Correct! In JSON, true and false are lowercase keywords without quotation marks.',
          isCorrect: true,
        },
        {
          id: 'opt-bool-2',
          label: '"true"',
          explanation: '"true" with quotes is a string containing 4 characters, NOT a boolean keyword!',
          isCorrect: false,
        },
        {
          id: 'opt-bool-3',
          label: 'TRUE',
          explanation: 'JSON is strictly case-sensitive. TRUE in capital letters is a syntax error.',
          isCorrect: false,
        },
      ],
      hint: 'JSON keywords must be lowercase and have no quotation marks.',
      successMessage: 'Well done! true, false, and null are reserved lowercase keywords.',
      mascotMessages: {
        intro: 'True or False: Do booleans need quotes? Let us see what you know! 💡',
        thinking: 'Keep it lowercase and leave off the quotes for genuine booleans and null.',
        success: 'Perfect! Lowercase true and false are real booleans in JSON. 👍',
      },
    },
    {
      id: 'step-5-arrays-and-nested-data',
      title: 'Arrays & Nested Data',
      subtitle: 'Lists and structures within structures',
      explanation:
        'Square brackets [ ] define an array — an ordered list of items. JSON documents can nest arrays inside objects, and objects inside arrays, allowing you to model complex, real-world data hierarchies.',
      codeSnippet: `{\n  "team": "JotDevs",\n  "members": [\n    { "name": "Byte", "role": "Mascot" },\n    { "name": "Sam", "role": "Lead" }\n  ]\n}`,
      highlightedLine: 3,
      activityType: 'multiple-choice',
      prompt: 'In the snippet above, what data structure is "members"?',
      options: [
        {
          id: 'opt-arr-1',
          label: 'An ARRAY containing two nested OBJECTS',
          explanation: 'Spot on! The square brackets [ ] make "members" an array, and each element inside { } is a distinct object.',
          isCorrect: true,
        },
        {
          id: 'opt-arr-2',
          label: 'A single string property with commas',
          explanation: 'Notice the square brackets [ ] and internal curly braces { } — it is a nested structure, not a flat string.',
          isCorrect: false,
        },
        {
          id: 'opt-arr-3',
          label: 'A numeric sequence index',
          explanation: '"members" is an array of objects holding structured member profiles.',
          isCorrect: false,
        },
      ],
      hint: 'Square brackets [ ] mark an array; curly braces { } mark an object.',
      successMessage: 'Brilliant! You unlocked the Structure Explorer capability! 🧩',
      mascotMessages: {
        intro: 'Now we are building real structures! Arrays use square brackets [ ]! 🏗️',
        thinking: 'Look at the outer brackets of "members", then look at what is inside them.',
        success: 'Woohoo! You understand how arrays and objects combine to build rich trees! 🌳',
      },
    },
    {
      id: 'step-6-strict-syntax-rules',
      title: 'Strict JSON Syntax Rules',
      subtitle: 'No single quotes, no trailing commas, no comments',
      explanation:
        'Standard JSON (RFC 8259) is very strict: 1) Keys must use double quotes (not single quotes). 2) Strings must use double quotes. 3) Trailing commas after the last item are forbidden. 4) Comments like // or /* */ are not permitted.',
      codeSnippet: `{\n  "title": "JotJSON",\n  "stars": 100\n}`,
      highlightedLine: 2,
      activityType: 'syntax-inspection',
      prompt: 'Which of the following snippets is 100% VALID strict standard JSON?',
      options: [
        {
          id: 'opt-valid-1',
          label: '{ "name": "Byte", "active": true }',
          explanation: 'Yes! Double quoted key, valid string and boolean, and no illegal trailing comma.',
          isCorrect: true,
        },
        {
          id: 'opt-valid-2',
          label: "{ 'name': 'Byte', 'active': true }",
          explanation: 'Invalid! JSON does NOT allow single quotes (\' \'). Only double quotes (" ") are allowed.',
          isCorrect: false,
        },
        {
          id: 'opt-valid-3',
          label: '{ "name": "Byte", "active": true, }',
          explanation: 'Invalid! Notice the trailing comma after true,. Trailing commas break strict JSON parsers.',
          isCorrect: false,
        },
      ],
      hint: 'Check for double quotes and make sure there are NO trailing commas at the end.',
      successMessage: 'Phenomenal work! You have mastered the core syntax rules of JSON! 🎓',
      mascotMessages: {
        intro: 'Final test of Lesson 1! Can you spot the only strictly valid JSON? 🕵️',
        thinking: 'Watch out for single quotes and trailing commas after the last item!',
        success: 'Hooray! You completed JSON Basics: Build Your First Object! 🏆🎉',
      },
    },
  ],
};
