export default function FlipNumber({ text }) {
  return (
    <div className="flip-group">
      {String(text).split("").map((ch, i) => (
        <div className="flip" key={i}>{ch}</div>
      ))}
    </div>
  );
}
