var gulp = require('gulp');
var requireDir = require('require-dir');

// Single path declarations
global.paths = {
  sources: ['./src/**/*.js'],
  tests: ['./test/*.js'],
  coverage: './coverage',
  ciOutput: 'test_report.xml'
};

// Coverage thresholds: bellow first is error, bellow second is warning
global.thresholds = {
  branches: [70, 90],
  functions: [70, 90],
  lines: [80, 90],
  statements: [70, 90]
};

requireDir('./gulp');
