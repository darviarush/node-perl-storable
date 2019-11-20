module.exports = {
  'moduleFileExtensions': ['js'],

  'collectCoverage': true,
  'coveragePathIgnorePatterns': [
      '/node_modules/',
      '/script/',
      'eslintrc.js',
      'jest.config.js',
      'package.json',
  ],
  'collectCoverageFrom': [
      '**',
  ],
  'coverageDirectory': '/tmp/node-perl-storable/coverage',
  'coverageThreshold': {
    'global': {
      'statements': 0,
      'branches': 0,
      'functions': 0,
      'lines': 0
    }
  }
}
