export default function DrawBalls({ numbers, matchSet, small }) {
  return (
    <div className="balls">
      {(numbers || []).map((n) => (
        <div key={n} className={`ball ${small ? "small" : ""} ${matchSet?.has(n) ? "match" : ""}`}>
          {n}
        </div>
      ))}
    </div>
  );
}
