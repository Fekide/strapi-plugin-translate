module.exports = {
  branches: ['main', { name: 'next', prerelease: true }],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/github',
    '@semantic-release/git',
  ],
}
