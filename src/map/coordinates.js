export const coordinateKey = (position) => position.map((value) => Number(value).toFixed(7)).join(",");

export function uniquePositions(positions) {
  return Array.from(new Map(positions.map((position) => [coordinateKey(position), position])).values());
}

export function convertWgs84Batch(BMap, positions) {
  return new Promise((resolve, reject) => {
    const points = positions.map(([longitude, latitude]) => new BMap.Point(longitude, latitude));
    new BMap.Convertor().translate(points, 1, 5, (result) => {
      if (result?.status === 0 && result.points?.length === positions.length) resolve(result.points);
      else reject(new Error(`Baidu coordinate conversion failed: ${result?.status ?? "missing"}`));
    });
  });
}

export async function convertWgs84Positions(BMap, positions) {
  const unique = uniquePositions(positions);
  const converted = [];
  for (let index = 0; index < unique.length; index += 10) {
    converted.push(...await convertWgs84Batch(BMap, unique.slice(index, index + 10)));
  }
  return new Map(unique.map((position, index) => [coordinateKey(position), converted[index]]));
}

export async function convertWgs84Point(BMap, position) {
  const [point] = await convertWgs84Batch(BMap, [position]);
  return point;
}
