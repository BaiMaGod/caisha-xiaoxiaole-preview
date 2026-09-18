export class FruitTemplate {
  constructor(definition) {
    this.id = definition.id;
    this.name = definition.name;
    this.width = definition.width;
    this.height = definition.height;
    this.cells = [];

    for (let y = 0; y < definition.rows.length; y++) {
      const row = definition.rows[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === '1') this.cells.push({ x, y });
      }
    }
  }
}
