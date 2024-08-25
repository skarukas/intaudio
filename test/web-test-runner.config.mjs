export default {
  concurrency: 2,
  nodeResolve: true,
  files: "**/*.test.js",
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '5000',
    },
  },
  testRunnerHtml: testFramework => `
    <html>
      <head>
        <!-- Load jQuery as global '$' -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
        <script type="module" src="${testFramework}"></script>
      </head>
    </html>
  `,
};