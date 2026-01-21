/**
 * Test script for mode detection functionality
 * Run with: node test_mode_detection.js
 */

import { detectMode, getModeSystemInstruction, MODES } from './utils/modeDetection.js';

console.log('='.repeat(60));
console.log('AISA MODE DETECTION TEST');
console.log('='.repeat(60));

const testCases = [
    {
        name: 'Normal Chat - Greeting',
        message: 'Hello, how are you?',
        attachments: [],
        expected: MODES.NORMAL_CHAT
    },
    {
        name: 'File Analysis - PDF Attachment',
        message: 'Analyze this document',
        attachments: [{ mimeType: 'application/pdf', base64Data: 'dummy' }],
        expected: MODES.FILE_ANALYSIS
    },
    {
        name: 'Coding Help - Code Question',
        message: 'How do I fix this JavaScript function?',
        attachments: [],
        expected: MODES.CODING_HELP
    },
    {
        name: 'Coding Help - Code Block',
        message: 'function test() { return null; }',
        attachments: [],
        expected: MODES.CODING_HELP
    },
    {
        name: 'Content Writing - Article Request',
        message: 'Write an article about AI technology',
        attachments: [],
        expected: MODES.CONTENT_WRITING
    },
    {
        name: 'Task Assistant - Planning',
        message: 'Help me plan my project timeline',
        attachments: [],
        expected: MODES.TASK_ASSISTANT
    },
    {
        name: 'Task Assistant - Todo List',
        message: 'Create a checklist for launching a product',
        attachments: [],
        expected: MODES.TASK_ASSISTANT
    },
    {
        name: 'File Analysis - Multiple Files',
        message: 'Compare these documents',
        attachments: [
            { mimeType: 'application/pdf', base64Data: 'dummy1' },
            { mimeType: 'application/pdf', base64Data: 'dummy2' }
        ],
        expected: MODES.FILE_ANALYSIS
    }
];

let passed = 0;
let failed = 0;

console.log('\nRunning test cases...\n');

testCases.forEach((test, index) => {
    const result = detectMode(test.message, test.attachments);
    const success = result === test.expected;

    if (success) {
        passed++;
        console.log(`✓ Test ${index + 1}: ${test.name}`);
        console.log(`  Message: "${test.message}"`);
        console.log(`  Detected: ${result}`);
    } else {
        failed++;
        console.log(`✗ Test ${index + 1}: ${test.name}`);
        console.log(`  Message: "${test.message}"`);
        console.log(`  Expected: ${test.expected}`);
        console.log(`  Got: ${result}`);
    }
    console.log('');
});

console.log('='.repeat(60));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

// Test system instruction generation
console.log('\nTesting System Instruction Generation...\n');

const modes = [
    MODES.NORMAL_CHAT,
    MODES.FILE_ANALYSIS,
    MODES.CONTENT_WRITING,
    MODES.CODING_HELP,
    MODES.TASK_ASSISTANT
];

modes.forEach(mode => {
    const instruction = getModeSystemInstruction(mode, 'English', { fileCount: 2 });
    console.log(`${mode}:`);
    console.log(`  Length: ${instruction.length} characters`);
    console.log(`  Preview: ${instruction.substring(0, 100)}...`);
    console.log('');
});

console.log('='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
