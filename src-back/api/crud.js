const CyclicDb = require("@cyclic.sh/dynamodb");
const db = CyclicDb(process.env.CYCLIC_DB);
var packageJson = require('./package.json');


module.exports = (app) => {
  // Create or Update an item

  app.get("/version", (req, res) => {

    res.json({"name": 2}).end();
  });


  app.post("/:col/:key", async (req, res) => {
    console.log(req.body);

    const col = req.params.col;
    const key = req.params.key;
    console.log(
      `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
        req.params
      )}`
    );
    const item = await db.collection(col).set(key, req.body);
    console.log(JSON.stringify(item, null, 2));
    res.json(item).end();
  });

  // Delete an item
  app.delete("/:col/:key", async (req, res) => {
    const col = req.params.col;
    const key = req.params.key;
    console.log(
      `from collection: ${col} delete key: ${key} with params ${JSON.stringify(
        req.params
      )}`
    );
    const item = await db.collection(col).delete(key);
    console.log(JSON.stringify(item, null, 2));
    res.json(item).end();
  });

  // Get a single item
  app.get("/:col/:key", async (req, res) => {
    const col = req.params.col;
    const key = req.params.key;
    console.log(
      `from collection: ${col} get key: ${key} with params ${JSON.stringify(
        req.params
      )}`
    );
    const item = await db.collection(col).get(key);
    console.log(JSON.stringify(item, null, 2));
    res.json(item).end();
  });


  app.get("/:col", async (req, res) => {
    const col = req.params.col;
    console.log(
      `list collection: ${col} with params: ${JSON.stringify(req.params)}`
    );
    const items = await db.collection(col).list();
    console.log(JSON.stringify(items, null, 2));
    res.json(items).end();
  });



  return app;
};
