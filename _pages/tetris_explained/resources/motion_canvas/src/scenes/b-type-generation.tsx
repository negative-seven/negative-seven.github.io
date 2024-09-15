import {
  Color,
  Vector2,
  all,
  delay,
  easeInOutCubic,
  easeOutCubic,
  range,
  waitFor,
} from "@motion-canvas/core";
import {
  Img,
  Layout,
  Line,
  Node,
  Rect,
  View2D,
  makeScene2D,
} from "@motion-canvas/2d";

const PIXEL_SIZE = 8;
const TILE_SIZE = 8 * PIXEL_SIZE;

const GARBAGE_ROW_INDICES = range(8, 20);

const IMAGES = {
  font: "resources/images/font.png",
  playfield: "resources/images/playfield.png",
  tile0: "resources/images/tile0.png",
  tile1: "resources/images/tile1.png",
  tile2: "resources/images/tile2.png",
  tileX: "resources/images/tilex.png",
};

const TILE_IMAGE_MAPPING = new Map<number | null, string>();
TILE_IMAGE_MAPPING.set(null, IMAGES.tileX);
TILE_IMAGE_MAPPING.set(0, IMAGES.tile0);
TILE_IMAGE_MAPPING.set(1, IMAGES.tile1);
TILE_IMAGE_MAPPING.set(2, IMAGES.tile2);

class Random {
  private value: number;

  public constructor(seed: number) {
    this.value = seed & 0xffff;
  }

  public get(): number {
    const newBit = ((this.value >> 9) ^ (this.value >> 1)) & 1;
    this.value = (newBit << 15) | (this.value >> 1);
    return this.value >> 8;
  }
}

// eslint-disable-next-line func-names
export default makeScene2D(function* (view: View2D) {
  const gridPosition = (x: number, y: number): Vector2 =>
    new Vector2(-view.width() / 2, -view.height() / 2).add([
      (x + 1.5) * TILE_SIZE,
      (y + 1.5) * TILE_SIZE,
    ]);

  const gridPositionJustified = (x: number, y: number): Vector2 =>
    gridPosition(x, y).sub(PIXEL_SIZE / 2);

  let tileLayer: Node;
  let highlightLayer: Node;
  let overlayLayer: Node;
  view.fill("black");
  view.add([
    <Node ref={(self: Node) => (tileLayer = self)} />,
    <Node ref={(self: Node) => (highlightLayer = self)} />,
    <Node ref={(self: Node) => (overlayLayer = self)} />,
    <Img src={IMAGES.playfield} scale={PIXEL_SIZE} smoothing={false} />,
  ]);

  const random = new Random(12345678);

  // Begin the animation

  // Generate tiles

  const tiles = range(20).map(() => new Array<Img>(10));
  const deleteTileHighlights = [];
  for (const y of GARBAGE_ROW_INDICES) {
    const timeScale = Math.min(2 ** (y - 8), 20);

    random.get();

    let addTileHighlight: Rect;
    highlightLayer.add(
      <Rect
        ref={(self: Rect) => (addTileHighlight = self)}
        size={TILE_SIZE - PIXEL_SIZE}
        lineWidth={8}
        stroke={"lime"}
        opacity={1}
      ></Rect>
    );
    addTileHighlight.position(gridPositionJustified(9, y));
    yield* addTileHighlight.opacity(1, 0.5 / timeScale);

    for (let x = 9; x >= 0; x--) {
      const tileType = [null, 0, null, 1, 2, 2, null, null][random.get() % 8];
      let tile: Img;
      tileLayer.add(
        <Img
          ref={(self: Img) => (tile = self)}
          src={TILE_IMAGE_MAPPING.get(tileType)}
          position={gridPosition(x, y)}
          scale={PIXEL_SIZE}
          smoothing={false}
          opacity={0}
        />
      );
      tiles[y][x] = tile;

      if (x !== 9) {
        // Don't move the highlight into position the first time, since it
        // starts in the correct position
        yield* addTileHighlight.position(
          gridPositionJustified(x, y),
          0.35 / timeScale
        );
      }

      // Make tile appear, and then disappear if it is an X
      yield* tile.opacity(1, 0.3 / timeScale, easeOutCubic);
      if (tileType === null) {
        yield* tile.opacity(0, 0.2 / timeScale, easeOutCubic);
      } else {
        yield* waitFor(0.2 / timeScale);
      }
    }

    yield* addTileHighlight.opacity(0, 0.5 / timeScale);
    addTileHighlight.remove();

    // Highlight and remove the tile that is guaranteed to be removed in this
    // row

    let x;
    do {
      x = random.get() % 16;
    } while (x >= 10);
    const deletedTile = tiles[y][x];

    let deleteTileHighlight: Rect;
    highlightLayer.add(
      <Rect
        ref={(self: Rect) => (deleteTileHighlight = self)}
        size={TILE_SIZE - PIXEL_SIZE}
        lineWidth={8}
        stroke={"red"}
        opacity={0}
      />
    );
    deleteTileHighlight.position(gridPositionJustified(x, y));
    yield* deleteTileHighlight.opacity(1, 0.5 / timeScale);
    yield* all(deletedTile.opacity(0, 0.5 / timeScale));
    deleteTileHighlights.push(deleteTileHighlight);
  }
  yield* waitFor(0.5);
  yield* all(...deleteTileHighlights.map((h) => h.opacity(0, 1.5)));

  // Create overlays for different height settings

  type HeightOverlay = Node & { lineNode: Line; textNode: Layout };
  const heightOverlays = [];
  for (const overlayIndex of range(6)) {
    let lineNode: Line;
    let textNode: Layout;
    const overlay = (
      <Node
        compositeOperation={"source-out"}
        position={gridPositionJustified(0, -2)}
      >
        <Line
          ref={(self: Line) => (lineNode = self)}
          points={[
            [-1 * TILE_SIZE, 0.5 * TILE_SIZE],
            [0.5 * TILE_SIZE, 0.5 * TILE_SIZE],
            [0.5 * TILE_SIZE, -0.5 * TILE_SIZE],
            [10 * TILE_SIZE, -0.5 * TILE_SIZE],
            [10 * TILE_SIZE, -100 * TILE_SIZE],
            [-1 * TILE_SIZE, -100 * TILE_SIZE],
          ].map(([x, y]: [number, number]) => new Vector2(x, y))}
          stroke={"gray"}
          lineWidth={8}
          fill={
            [
              "#004000c0",
              "#004040c0",
              "#000040c0",
              "#400040c0",
              "#400000c0",
              "#404000c0",
            ][overlayIndex]
          }
        />
        ,
        <Layout
          ref={(self: Layout) => (textNode = self)}
          layout
          position={[5 * TILE_SIZE, -1.1 * TILE_SIZE]}
        >
          {/* "HEIGHT ${n}" */}
          {[17, 14, 18, 16, 17, 29, 36, overlayIndex].map((characterIndex) => (
            // Image cropped to display only one character
            <Rect size={(TILE_SIZE * 3) / 4} clip>
              <Img
                src={IMAGES.font}
                offset={[-1, -1]}
                position={new Vector2(
                  -TILE_SIZE / 2 - TILE_SIZE * characterIndex,
                  -TILE_SIZE / 2
                ).mul(3 / 4)}
                scale={(PIXEL_SIZE * 3) / 4}
                smoothing={false}
                layout={false}
              />
            </Rect>
          ))}
        </Layout>
        ,
      </Node>
    ) as HeightOverlay;
    overlay.lineNode = lineNode;
    overlay.textNode = textNode;

    // Every overlay except the last is masked by a shape that covers the same
    // area as the previous overlay, so that fill colors don't stack

    if (overlayIndex > 0) {
      const previousOverlayContainer =
        heightOverlays[heightOverlays.length - 1].parent();
      const previousOverlayMask = lineNode.reactiveClone({
        position: () => overlay.position(),
        fill: "black",
        // Workaround for the mask getting displayed when the overlay it is
        // masking becomes transparent
        opacity: () =>
          previousOverlayContainer.childAs(1).opacity() === 0 ? 0 : 1,
        compositeOperation: "source-over",
      });
      previousOverlayContainer.children()[0] = previousOverlayMask;
    }

    heightOverlays.push(overlay);
    overlayLayer.add(
      <Node cache>
        <Node />
        {overlay}
      </Node>
    );
  }

  // Show height overlays

  const overlayHeights = [20.3, 17, 15, 12, 10, 8];
  const selectedHeightIndex = 3;
  const selectedHeightOverlay = heightOverlays[selectedHeightIndex];

  yield* all(
    ...heightOverlays.map((overlay, index) =>
      overlay.position(gridPositionJustified(0, overlayHeights[index]), 2)
    )
  );

  yield* all(
    waitFor(2),
    delay(
      0.85,
      selectedHeightOverlay.textNode.rotation(-3, 0.1).to(3, 0.1).to(0, 0.1)
    )
  );

  // Scatter all but one overlay

  yield* all(
    ...heightOverlays.flatMap((overlay, index) => [
      overlay.position(
        gridPositionJustified(
          0,
          (overlayHeights[index] - overlayHeights[selectedHeightIndex]) * 8 +
            overlayHeights[selectedHeightIndex]
        ),
        2
      ),
      overlay.opacity(overlay === selectedHeightOverlay ? 1 : 0, 2),
    ])
  );

  // Fade the selected height overlay to black, covering some board tiles

  yield* all(
    selectedHeightOverlay.lineNode.fill(
      "black",
      1,
      easeInOutCubic,
      Color.createLerp("hsv")
    ),
    selectedHeightOverlay.lineNode.stroke(
      "black",
      1,
      easeInOutCubic,
      Color.createLerp("hsv")
    ),
    selectedHeightOverlay.lineNode.opacity(1, 1),
    selectedHeightOverlay.textNode.opacity(0, 1)
  );
  yield* waitFor(0.5);
});
