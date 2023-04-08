diff ./README.md plugin/README.md && echo READMEs match
diff ./playground/package.json ./playground/templates/template.package.json -I '@strapi/.*' && echo playgorund/package.json match