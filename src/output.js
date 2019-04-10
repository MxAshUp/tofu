module.exports = (options = {}) => {

  const {
    source,
  } = options;

  const propertiesJSON = JSON.stringify({
    "name": "Vue",
    "version": "0.1.0",
    "description": "A format to use Vue",
    "author": "Dustin Woods",
    "image": "",
    "url": "",
    "license": "",
    "proofing": false,
    "source": source
  });

  return `window.storyFormat(${propertiesJSON});`
}