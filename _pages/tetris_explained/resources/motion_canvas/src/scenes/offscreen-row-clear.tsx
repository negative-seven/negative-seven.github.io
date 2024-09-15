import {
  Color,
  Vector2,
  all,
  clamp,
  delay,
  easeInOutCubic,
  easeOutCubic,
  range,
  useLogger,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import {
  Img,
  Layout,
  Line,
  Node,
  Rect,
  Txt,
  Video,
  View2D,
  makeScene2D,
} from "@motion-canvas/2d";

import rawVideo from "../../resources/videos/offscreen_row_clear_raw.webm";

const PIXEL_SIZE = 8;
const TILE_SIZE = 8 * PIXEL_SIZE;

const inverseLerpClamped = (
  start: number,
  end: number,
  value: number
): number => clamp(0, 1, (value - start) / (end - start));

// eslint-disable-next-line func-names
export default makeScene2D(function* (view: View2D) {
  let video: Video;
  let highlight: Rect;
  yield view.add([
    <Video
      ref={(self: Video) => (video = self)}
      src={rawVideo}
      scale={PIXEL_SIZE}
      smoothing={false}
    />,
    <Rect
      ref={(self: Rect) => (highlight = self)}
      offset={[-1, -1]}
      size={[11 * TILE_SIZE, 2 * TILE_SIZE]}
      stroke={"red"}
      lineWidth={4 * PIXEL_SIZE}
      opacity={0}
    ></Rect>,
  ]);

  highlight.position(() => {
    const ROW_CLEAR_TIMES = [
      40.54, 48.28, 52.98, 59.11, 63.58, 69.7, 75.56, 81.7, 86.1, 93.5, 98.86,
      106.7, 112.14, 115.87, 120.94, 126.1,
    ];

    let position = new Vector2(11.5 * TILE_SIZE, 8.5 * TILE_SIZE)
      .sub(PIXEL_SIZE / 2)
      .sub(view.size().div(2));
    for (const rowClearTime of ROW_CLEAR_TIMES) {
      const easeStartTime = rowClearTime - 0.05;
      const easeEndTime = rowClearTime + 0.05;
      const easeValue = inverseLerpClamped(
        easeStartTime,
        easeEndTime,
        video.getCurrentTime()
      );
      position = position.addY(easeInOutCubic(easeValue, 0, TILE_SIZE));
    }
    return position;
  });

  video.play();

  video.seek(6.66);
  video.playbackRate(10);
  yield* waitUntil("slow0");
  video.playbackRate(1);
  yield* waitUntil("showHighlight");
  yield* highlight.opacity(0.7, 0.5);
  yield* waitUntil("fast0");
  video.playbackRate(40);
  yield* waitUntil("slow1");
  video.playbackRate(1);
  yield* waitUntil("fast1");
  video.playbackRate(150);
  yield* waitUntil("slow2");
  video.playbackRate(1);
  yield* waitUntil("hideHighlight");
  yield* highlight.opacity(0, 0.5);
  yield* waitUntil("end");
});
