const fetch = require('cross-fetch');

module.exports = async function () {
  const res = await fetch(
    `https://prod-qore-app.qorebase.io/4c3PQ2IHffdLVVd/allLessons/rows?limit=50&offset=0&$order=asc`
  );
  const { nodes } = await res.json();

  return nodes;
};
