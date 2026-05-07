const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.get("/api/productos", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("id", { ascending: true });

  if (error) return res.status(500).json({ mensaje: "Error al listar productos", error });
  res.json(data);
});

app.get("/api/productos/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ mensaje: "Producto no encontrado" });
  res.json(data);
});

app.post("/api/productos", async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;

  if (!nombre || !categoria || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  const nuevo = { nombre, categoria, precio: Number(precio), stock: Number(stock) };

  const { data, error } = await supabase
    .from("productos")
    .insert([nuevo])
    .select()
    .single();

  if (error) return res.status(500).json({ mensaje: "Error al crear producto", error });
  res.status(201).json(data);
});

app.put("/api/productos/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("productos")
    .update(req.body)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ mensaje: "Producto no encontrado" });
  res.json(data);
});

app.delete("/api/productos/:id", async (req, res) => {
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ mensaje: "Error al eliminar producto", error });
  res.json({ mensaje: "Producto eliminado" });
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});