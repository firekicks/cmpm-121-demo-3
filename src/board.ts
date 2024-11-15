import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
}

export class Board {
  readonly tileWidth: number;
  readonly neighborhoodRadius: number;
  private readonly knownCells: Map<string, Cell>;

  constructor(tileWidth: number, neighborhoodRadius: number) {
    this.tileWidth = tileWidth;
    this.neighborhoodRadius = neighborhoodRadius;
    this.knownCells = new Map<string, Cell>();
  }

  private getCanonicalCell(cell: Cell): Cell {
    const { i, j } = cell;
    const key = [i, j].toString();
    if (!this.knownCells.has(key)) {
      this.knownCells.set(key, { i, j });
    }
    return this.knownCells.get(key)!;
  }

  getCellForPoint(point: leaflet.LatLng): Cell {
    const i = Math.floor(point.lat / this.tileWidth);
    const j = Math.floor(point.lng / this.tileWidth);
    return this.getCanonicalCell({ i, j });
  }

  getCellBounds(cell: Cell): leaflet.LatLngBounds {
    return leaflet.latLngBounds([
      [cell.i * this.tileWidth, cell.j * this.tileWidth],
      [(cell.i + 1) * this.tileWidth, (cell.j + 1) * this.tileWidth],
    ]);
  }

  getCellsNearPoint(point: leaflet.LatLng): Cell[] {
    const resultCells: Cell[] = [];
    const radius = this.neighborhoodRadius * this.tileWidth;

    for (let i = -radius; i <= radius; i += this.tileWidth) {
      for (let j = -radius; j <= radius; j += this.tileWidth) {
        resultCells.push(this.getCellForPoint(
          leaflet.latLng(point.lat + i, point.lng + j),
        ));
      }
    }
    return resultCells;
  }
}
