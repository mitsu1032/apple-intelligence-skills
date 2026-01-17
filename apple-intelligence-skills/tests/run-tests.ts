#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

// Types
interface Frontmatter {
  name?: string;
  description?: string;
  globs?: string;
  [key: string]: string | undefined;
}

interface TestFailure {
  test: string;
  reason: string;
}

interface PluginJson {
  name?: string;
  description?: string;
  version?: string;
  [key: string]: unknown;
}

// Colors for terminal output
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
} as const;

// Test state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: TestFailure[] = [];

function pass(testName: string): void {
  totalTests++;
  passedTests++;
  console.log(`  ${COLORS.green}✓${COLORS.reset} ${testName}`);
}

function fail(testName: string, reason: string): void {
  totalTests++;
  failedTests++;
  console.log(`  ${COLORS.red}✗${COLORS.reset} ${testName}`);
  failures.push({ test: testName, reason });
}

function section(name: string): void {
  console.log(`\n${COLORS.bold}${name}${COLORS.reset}`);
}

// Parse YAML frontmatter from markdown
function parseFrontmatter(content: string): Frontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result: Frontmatter = {};

  for (const line of yaml.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }

  return result;
}

// Test: Validate SKILL.md files
function testSkillFiles(): void {
  section('Skill Files Validation');

  const skillsDir = path.join(__dirname, '..', 'skills');

  if (!fs.existsSync(skillsDir)) {
    fail('Skills directory exists', 'skills/ directory not found');
    return;
  }
  pass('Skills directory exists');

  const skillDirs = fs.readdirSync(skillsDir).filter((f: string) => {
    const fullPath = path.join(skillsDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  if (skillDirs.length === 0) {
    fail('At least one skill exists', 'No skill directories found');
    return;
  }
  pass(`Found ${skillDirs.length} skill(s)`);

  for (const skillDir of skillDirs) {
    const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      fail(`${skillDir}/SKILL.md exists`, 'File not found');
      continue;
    }
    pass(`${skillDir}/SKILL.md exists`);

    const content = fs.readFileSync(skillPath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    if (!frontmatter) {
      fail(`${skillDir} has valid frontmatter`, 'No frontmatter found');
      continue;
    }

    if (!frontmatter.name) {
      fail(`${skillDir} has name in frontmatter`, 'name is missing');
    } else {
      pass(`${skillDir} has name: ${frontmatter.name}`);
    }

    if (!frontmatter.description) {
      fail(`${skillDir} has description`, 'description is missing');
    } else {
      pass(`${skillDir} has description`);
    }

    // Check for required sections
    const requiredSections = ['## 概要', '## 公式リファレンス'];
    for (const section of requiredSections) {
      if (content.includes(section)) {
        pass(`${skillDir} has "${section}" section`);
      } else {
        fail(`${skillDir} has "${section}" section`, 'Section not found');
      }
    }

    // Check for Apple official links only
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
      const url = match[2];
      if (url.includes('developer.apple.com') ||
          url.includes('swift.org') ||
          url.includes('apple.com')) {
        // Valid Apple official link
      } else {
        fail(`${skillDir} uses only Apple official links`, `Found non-Apple link: ${url}`);
      }
    }
  }
}

// Test: Validate plugin.json
function testPluginJson(): void {
  section('Plugin.json Validation');

  const pluginPath = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');

  if (!fs.existsSync(pluginPath)) {
    fail('plugin.json exists', 'File not found');
    return;
  }
  pass('plugin.json exists');

  try {
    const content = fs.readFileSync(pluginPath, 'utf-8');
    const json: PluginJson = JSON.parse(content);

    if (json.name === 'apple-intelligence-skills') {
      pass('plugin.json has correct name');
    } else {
      fail('plugin.json has correct name', `Expected "apple-intelligence-skills", got "${json.name}"`);
    }

    if (json.version) {
      pass(`plugin.json has version: ${json.version}`);
    } else {
      fail('plugin.json has version', 'version is missing');
    }

    if (json.description && json.description.length > 0) {
      pass('plugin.json has description');
    } else {
      fail('plugin.json has description', 'description is missing or empty');
    }
  } catch (e) {
    fail('plugin.json is valid JSON', String(e));
  }
}

// Main
function main(): void {
  console.log(`${COLORS.bold}Apple Intelligence Skills - Test Suite${COLORS.reset}`);
  console.log('='.repeat(50));

  testPluginJson();
  testSkillFiles();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`${COLORS.bold}Summary${COLORS.reset}`);
  console.log(`  Total:  ${totalTests}`);
  console.log(`  ${COLORS.green}Passed: ${passedTests}${COLORS.reset}`);
  if (failedTests > 0) {
    console.log(`  ${COLORS.red}Failed: ${failedTests}${COLORS.reset}`);
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${f.test}`);
      console.log(`    ${COLORS.yellow}→ ${f.reason}${COLORS.reset}`);
    }
    process.exit(1);
  }
  console.log(`\n${COLORS.green}All tests passed!${COLORS.reset}`);
}

main();
