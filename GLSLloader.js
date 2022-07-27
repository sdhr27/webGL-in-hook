function loader(source) {
  const code = String(source).replace(/\/\/(.)+/g, '');
  return `export default \`${code}\``;
}
module.exports = loader;
